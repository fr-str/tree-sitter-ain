import XCTest
import SwiftTreeSitter
import TreeSitterAin

final class TreeSitterAinTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_ain())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Ain grammar")
    }
}
