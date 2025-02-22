package tree_sitter_ain_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_ain "github.com/tree-sitter/tree-sitter-ain/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ain.Language())
	if language == nil {
		t.Errorf("Error loading Ain grammar")
	}
}
