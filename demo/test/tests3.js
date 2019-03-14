window.sources = [
    "./test-namespaces-2.js"
];

QUnit.module("namespaces");

QUnit.test("window.TopLevel.SecondLevel3 exists", function (assert) {
    assert.ok(window.TopLevel.SecondLevel3);
});

QUnit.module("DOM");

QUnit.test("id #my-elem exists", function (assert) {
    assert.ok(document.getElementById("my-elem"));
});