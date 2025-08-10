"""
Shinseider Validation System
補助金申請要件のバリデーション処理を行うモジュール

Based on: shinseider_ルール雛形_v_1_（省力化一般）＋検証仕様・テストケース.md
"""

import json
import yaml
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class RuleType(Enum):
    BOOLEAN = "boolean"
    ENUM_IN = "enum_in" 
    NUMBER_RANGE = "number_range"
    FILE_REQUIRED = "file_required"
    COMPOUND_REQUIRED = "compound_required"
    CALC_EQUAL = "calc_equal"
    FILE_OR_FORM = "file_or_form"


class Severity(Enum):
    BLOCK = "block"  # 致命的エラー - 提出不可
    WARN = "warn"    # 警告 - 確認推奨


@dataclass
class ValidationRule:
    """バリデーションルールの定義"""
    id: str
    desc: str
    type: RuleType
    field: Optional[str] = None
    fields: Optional[List[str]] = None
    params: Optional[Dict[str, Any]] = None
    severity: Severity = Severity.BLOCK
    source_id: str = ""
    quote: str = ""


@dataclass 
class ValidationFinding:
    """バリデーション結果の個別発見事項"""
    rule_id: str
    severity: Severity
    message: str
    field: Optional[str] = None


@dataclass
class ValidationResult:
    """バリデーション結果の全体"""
    findings: List[ValidationFinding]
    submit_ready: bool  # block=0の場合True
    
    @property
    def blocks(self) -> List[ValidationFinding]:
        return [f for f in self.findings if f.severity == Severity.BLOCK]
    
    @property  
    def warnings(self) -> List[ValidationFinding]:
        return [f for f in self.findings if f.severity == Severity.WARN]


class SubsidyValidator:
    """補助金申請バリデーター"""
    
    def __init__(self, rules_config: Dict[str, Any]):
        """
        Args:
            rules_config: rules.json形式の設定データ
        """
        self.config = rules_config
        self.rules = self._parse_rules()
        
    def _parse_rules(self) -> List[ValidationRule]:
        """設定からバリデーションルールを生成"""
        rules = []
        
        # eligibility rules
        for rule_data in self.config.get("eligibility", []):
            rules.append(self._create_rule(rule_data))
            
        # scope rules  
        for rule_data in self.config.get("scope", []):
            rules.append(self._create_rule(rule_data))
            
        # attachment rules
        for rule_data in self.config.get("attachments", []):
            rules.append(self._create_rule(rule_data))
            
        return rules
    
    def _create_rule(self, rule_data: Dict[str, Any]) -> ValidationRule:
        """辞書データからValidationRuleオブジェクトを生成"""
        return ValidationRule(
            id=rule_data["id"],
            desc=rule_data["desc"],
            type=RuleType(rule_data["type"]),
            field=rule_data.get("field"),
            fields=rule_data.get("fields"),
            params=rule_data.get("params", {}),
            severity=Severity(rule_data.get("severity", "block")),
            source_id=rule_data.get("source_id", ""),
            quote=rule_data.get("quote", "")
        )
    
    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        """申請データをバリデーション"""
        findings = []
        
        for rule in self.rules:
            try:
                if not self._execute_rule(rule, data):
                    finding = ValidationFinding(
                        rule_id=rule.id,
                        severity=rule.severity,
                        message=rule.desc,
                        field=rule.field
                    )
                    findings.append(finding)
                    logger.info(f"Validation failed: {rule.id} - {rule.desc}")
                    
            except Exception as e:
                logger.error(f"Rule execution error: {rule.id} - {e}")
                # エラーの場合は警告として扱う
                findings.append(ValidationFinding(
                    rule_id=rule.id,
                    severity=Severity.WARN,
                    message=f"検証エラー: {rule.desc}",
                    field=rule.field
                ))
        
        # 致命的エラーがなければ提出可能
        submit_ready = not any(f.severity == Severity.BLOCK for f in findings)
        
        return ValidationResult(findings=findings, submit_ready=submit_ready)
    
    def _execute_rule(self, rule: ValidationRule, data: Dict[str, Any]) -> bool:
        """個別ルールの実行"""
        
        if rule.type == RuleType.BOOLEAN:
            return bool(self._get_field_value(data, rule.field))
            
        elif rule.type == RuleType.ENUM_IN:
            value = self._get_field_value(data, rule.field)
            allowed = rule.params.get("allowed", [])
            return value in allowed
            
        elif rule.type == RuleType.NUMBER_RANGE:
            value = float(self._get_field_value(data, rule.field) or 0)
            min_val = rule.params.get("min")
            max_val = rule.params.get("max")
            
            min_ok = min_val is None or value >= min_val
            max_ok = max_val is None or value <= max_val
            return min_ok and max_ok
            
        elif rule.type == RuleType.FILE_REQUIRED:
            return bool(self._get_field_value(data, rule.field))
            
        elif rule.type == RuleType.COMPOUND_REQUIRED:
            if not rule.fields:
                return False
            return all(bool(self._get_field_value(data, field)) for field in rule.fields)
            
        elif rule.type == RuleType.CALC_EQUAL:
            lhs = self._calc_expression(rule.params.get("lhs", ""), data)
            rhs = self._calc_expression(rule.params.get("rhs", ""), data) 
            tolerance = rule.params.get("tolerance", 0.5)
            return abs(lhs - rhs) <= tolerance
            
        elif rule.type == RuleType.FILE_OR_FORM:
            return bool(self._get_field_value(data, rule.field))
            
        else:
            logger.warning(f"Unknown rule type: {rule.type}")
            return True
    
    def _get_field_value(self, data: Dict[str, Any], field_path: str) -> Any:
        """ネストしたフィールドの値を取得 (例: "applicant.sme_class_ok")"""
        if not field_path:
            return None
            
        try:
            value = data
            for key in field_path.split('.'):
                value = value.get(key) if isinstance(value, dict) else None
                if value is None:
                    break
            return value
        except (AttributeError, TypeError):
            return None
    
    def _calc_expression(self, expression: str, data: Dict[str, Any]) -> float:
        """簡単な計算式の評価 (例: "sum(items[].ex_tax)")"""
        if not expression:
            return 0.0
            
        # 基本的なフィールド参照
        if '.' in expression and not expression.startswith('sum('):
            return float(self._get_field_value(data, expression) or 0)
        
        # sum()関数の処理
        if expression.startswith('sum(') and expression.endswith(')'):
            # "sum(items[].ex_tax)" -> "items"から"ex_tax"の合計
            inner = expression[4:-1]  # "items[].ex_tax"
            if '[].' in inner:
                array_path, field_name = inner.split('[].')
                items = self._get_field_value(data, array_path)
                if isinstance(items, list):
                    total = sum(float(item.get(field_name, 0)) for item in items if isinstance(item, dict))
                    return total
        
        try:
            # 直接的な数値の場合
            return float(expression)
        except ValueError:
            logger.warning(f"Cannot evaluate expression: {expression}")
            return 0.0


def load_rules_from_yaml(subsidy_id: str, subsidies_yaml_path: str) -> Optional[Dict[str, Any]]:
    """subsidies.yamlから指定された補助金のルールを読み込み"""
    try:
        with open(subsidies_yaml_path, 'r', encoding='utf-8') as f:
            subsidies = yaml.safe_load(f)
        
        for subsidy in subsidies:
            if subsidy.get('id') == subsidy_id:
                # バリデーション設定がある場合は返す
                return subsidy.get('validation', {})
        
        logger.warning(f"Subsidy {subsidy_id} not found in {subsidies_yaml_path}")
        return None
        
    except Exception as e:
        logger.error(f"Failed to load rules: {e}")
        return None


# 使用例とテスト
if __name__ == "__main__":
    # テスト用のルール設定
    test_rules = {
        "eligibility": [
            {
                "id": "e-01-sme",
                "desc": "中小企業者等に該当",
                "type": "boolean", 
                "field": "applicant.sme_class_ok",
                "severity": "block"
            }
        ],
        "scope": [
            {
                "id": "s-01-budget",
                "desc": "予算が範囲内",
                "type": "number_range",
                "field": "budget.total_million",
                "params": {"min": 1, "max": 100},
                "severity": "warn"
            }
        ],
        "attachments": [
            {
                "id": "a-01-quote", 
                "desc": "見積書が必須",
                "type": "file_required",
                "field": "files.quote",
                "severity": "block"
            }
        ]
    }
    
    # テストデータ
    test_data = {
        "applicant": {"sme_class_ok": True},
        "budget": {"total_million": 50},
        "files": {"quote": False}  # これは失敗する
    }
    
    # バリデーション実行
    validator = SubsidyValidator(test_rules)
    result = validator.validate(test_data)
    
    print(f"提出可能: {result.submit_ready}")
    print(f"ブロックエラー: {len(result.blocks)}件")
    print(f"警告: {len(result.warnings)}件")
    
    for finding in result.findings:
        print(f"- {finding.severity.value}: {finding.message}")