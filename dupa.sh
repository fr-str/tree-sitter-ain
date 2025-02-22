#!/bin/env bash 
set -e
tree-sitter generate

for f in ./test-files/*; do
    echo "$f ----"
    tree-sitter parse "$f"
    echo -e "\n"
done
exit 0
