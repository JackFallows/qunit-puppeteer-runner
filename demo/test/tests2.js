QUnit.module("Array");

QUnit.test("#indexOf() should return -1 when the value is not present", function(assert) {
    assert.equal([1,2,3].indexOf(4), -1);
});

QUnit.module("namespaces");

QUnit.test("window should exist", function(assert) {
    assert.ok(window);
});

QUnit.test("TopLevel should exist", function(assert) {
    assert.ok(window.TopLevel);
});