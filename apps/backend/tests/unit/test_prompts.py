"""Tests para los prompts del sistema de IA."""
from ai.prompts.system import OUTPUT_INSTRUCTIONS, SYSTEM_PROMPT, WARNINGS_ADDENDUM


class TestSystemPrompt:
    def test_prompt_not_empty(self):
        assert len(SYSTEM_PROMPT.strip()) > 0

    def test_prompt_mentions_language(self):
        assert "idioma" in SYSTEM_PROMPT.lower() or "language" in SYSTEM_PROMPT.lower()

    def test_prompt_is_string(self):
        assert isinstance(SYSTEM_PROMPT, str)


class TestWarningsAddendum:
    def test_has_placeholder(self):
        assert "{warnings}" in WARNINGS_ADDENDUM

    def test_can_format(self):
        result = WARNINGS_ADDENDUM.format(warnings="Test warning")
        assert "Test warning" in result


class TestOutputInstructions:
    def test_has_word_format(self):
        assert "word" in OUTPUT_INSTRUCTIONS
        assert len(OUTPUT_INSTRUCTIONS["word"].strip()) > 0

    def test_has_pptx_format(self):
        assert "pptx" in OUTPUT_INSTRUCTIONS
        assert len(OUTPUT_INSTRUCTIONS["pptx"].strip()) > 0

    def test_has_excel_format(self):
        assert "excel" in OUTPUT_INSTRUCTIONS
        assert len(OUTPUT_INSTRUCTIONS["excel"].strip()) > 0

    def test_has_both_format(self):
        assert "both" in OUTPUT_INSTRUCTIONS

    def test_has_all_format(self):
        assert "all" in OUTPUT_INSTRUCTIONS

    def test_pptx_mentions_slide_separator(self):
        assert "---SLIDE---" in OUTPUT_INSTRUCTIONS["pptx"]

    def test_excel_mentions_table_separator(self):
        assert "---TABLE---" in OUTPUT_INSTRUCTIONS["excel"]

    def test_word_mentions_markdown_sections(self):
        word_instr = OUTPUT_INSTRUCTIONS["word"]
        assert "##" in word_instr or "Resumen" in word_instr
