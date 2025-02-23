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
      // $.config
      // $.backend
      // $.backendoptions
      ),

    host: $ => seq(
      '[',
      $.host_key,
      ']',
       optional($.value)
     ),
    host_key:$=>new RustRegex('(?i)host'), 

    query: $=> seq(
      '[',
      $.querys_key,
      ']',
       optional(repeat($.query_key_val))
     ),
    querys_key:$=>new RustRegex('(?i)query'),

    query_key: $=> $.identifier,
    query_val: $=> seq('=',optional(choice(
      $.bool,
      $.number,
      $.query_any
    ))),
    query_any: $=> /(.+)?/,
    query_key_val: $=> seq(
      $.query_key,
      optional($.query_val),
    ),

    headers: $=> seq(
      '[',
      $.headers_key,
      ']',
      optional(repeat($.header_key_val))
    ),
    headers_key:$=>new RustRegex('(?i)headers'),

    header_key: $=> $.identifier,
    header_val: $=> /(.+)?/,
    header_key_val: $=> seq(
      $.header_key,
      ':',
      optional(' '),
      optional($.header_val)
    ),

    method: $=> seq(
      '[',
      $.method_key,
      ']',
      optional($.value)
    ),
    method_key: $=> new RustRegex('(?i)method'),

    body: $=> seq(
      '[',
      $.body_key,
      ']',
      optional(choice(
        $.json_body,
        $.urlencoded_body,
        // $.plain_body,
        ))
    ),
    body_key:$ => new RustRegex('(?i)body'),

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
      $.json_bool,
      $.json_null
    ),

    json_bool: $=> /true|false/,
    json_null: $=> 'null',
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
    number: $=> token(prec(1,/[0-9.]+/)),
    identifier: $=> new RustRegex('(?i)[0-9a-z/_-]+'),
    bool: $=> token(prec(2,new RustRegex('(?i)true|false'))),
    _: $ => /\s+/,
    comment: $ => /#.*/
  }
});

