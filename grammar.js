/**
 * @file Ain grammar for tree-sitter
 * @author fr-str
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
    name: 'ain',
  conflicts: ($ => [
    [$.query_key_val],
    [$.body]
  ]),
  rules: {
    // The main program consists of multiple sections
    program: $ => seq(
      repeat($.section)
      // optional($.body_section)
    ),

    // A section starts with a keyword in brackets followed by content
    section: $ => choice(
      $.host,
      $.query,
      $.headers,
      $.method,
      $.body,
      //   new RustRegex('(?i)config'),
      //   optional($.value)),
      // seq(
      //   new RustRegex('(?i)backend'),
      //   optional($.value)),
      // seq(
      //   new RustRegex('(?i)backendoptions'),
      //   optional($.value)),
      ),

    host: $ => seq(
      '[',
       new RustRegex('(?i)host'), 
      ']',
       optional($.value)
     ),

    query: $=> seq(
      '[',
       new RustRegex('(?i)query'),
      ']',
       optional(repeat($.query_key_val))
     ),

    query_key: $=> $.string,
    query_val: $=> choice(
      $.bool,
      $.number,
      $.value
    ),
    query_key_val: $=> seq(
      $.query_key,
      '=',
      optional($.query_val),
    ),

    headers: $=> seq(
      '[',
      new RustRegex('(?i)headers'),
      ']',
      optional(repeat($.header_key_val))
    ),

    header_key: $=> $.string,
    header_val: $=> $.value,
    header_key_val: $=> seq(
      $.header_key,
      ':',
      optional(' '),
      $.header_val
    ),

    method: $=> seq(
      '[',
      new RustRegex('(?i)method'),
      ']',
      optional($.value)
    ),

    body: $=> seq(
      '[',
      new RustRegex('(?i)body'),
      ']',
      optional(choice(
        $.json_body,
        $.urlencoded_body,
        // $.plain_body,
        ))
    ),

    // JSON body parsing
    json_body: $ => choice(
      prec(2,$.json_object),
      $.json_array
    ),

    json_object: $ => seq(
      '{',
      optional(seq(
        $.json_pair,
        repeat(seq(',', $.json_pair))
      )),
      '}'
    ),

    json_array: $ => seq(
      '[',
      optional(seq(
        $.json_value,
        repeat(seq(',', $.json_value))
      )),
      ']'
    ),

    json_pair: $ => seq(
      $.json_string,
      ':',
      $.json_value
    ),

    json_value: $ => choice(
      $.json_object,
      $.json_array,
      $.json_string,
      $.json_number,
      'true',
      'false',
      'null'
    ),

    json_string: $ => /"(?:[^"\\]|\\.)*"/,
    json_number: $ => /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/,

    // Plain text body
    plain_body: $ => repeat1(/[^\n]+/),


    // URL-encoded body
    urlencoded_body: $ => seq(
      $.urlencoded_key_val,
      repeat(seq(
      $.urlencoded_amper,
      $.urlencoded_key_val,
      ))
    ),

    urlencoded_key: $=> /[^%][a-z0-9A-Z-_]+/, 
    // match either sequence of non-% or % followed by anything except "26"
    urlencoded_val: $=> /[^%\n]+|%[^26][^%\n]*|%2[^6][^%\n]*|%[^2][^%\n]*/,
    urlencoded_equals:$=> '%3D',
    urlencoded_amper:$=> '%26',
    urlencoded_key_val: $=> seq(
      $.urlencoded_key,
      $.urlencoded_equals,
      optional($.urlencoded_val)
     ),
      

    // Base rules
    value: $ => /[^\n]+/,
    number: $=> /[0-9.]+/,
    string: $=> new RustRegex('(?i)[0-9a-z/_-]+'),
    bool: $=> token(prec(2,new RustRegex('(?i)true|false'))),
    _: $ => /\s+/,
    comment: $ => /#.*/
  }
});

