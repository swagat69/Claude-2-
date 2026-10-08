import assert from "node:assert/strict";
import test from "node:test";
import {
  formatAmount,
  formatSgPhone,
  normalizeSgPhone,
  parseAmount,
  validateAmount,
  validateEmail,
  validateSgPhone,
} from "./format.ts";

test("phone numbers normalise from common typed forms", () => {
  assert.equal(normalizeSgPhone("9123 4567"), "91234567");
  assert.equal(normalizeSgPhone("+65 9123-4567"), "91234567");
  assert.equal(normalizeSgPhone("6591234567"), "91234567");
  assert.equal(normalizeSgPhone("(65) 6123 4567"), "61234567");
  assert.equal(normalizeSgPhone("0065 9123 4567"), "91234567");
});

test("an explicit +65 is never read as part of an incomplete number", () => {
  assert.equal(normalizeSgPhone("+65 912345"), "912345");
  assert.equal(formatSgPhone("+65 912345"), "912345");
  assert.equal(validateSgPhone("+65 912345"), "Enter an 8-digit Singapore number, like 9123 4567");
});

test("a landline that starts with 65 keeps its digits", () => {
  assert.equal(normalizeSgPhone("6512 3456"), "65123456");
  assert.equal(validateSgPhone("6512 3456", { mobileOnly: false }), null);
});

test("phone numbers format as #### ####", () => {
  assert.equal(formatSgPhone("91234567"), "9123 4567");
  assert.equal(formatSgPhone("+6591234567"), "9123 4567");
  assert.equal(formatSgPhone("9123"), "9123");
});

test("phone validation explains how to fix each problem", () => {
  assert.equal(validateSgPhone(""), "Enter your mobile number");
  assert.equal(validateSgPhone("9123 456"), "Enter an 8-digit Singapore number, like 9123 4567");
  assert.equal(validateSgPhone("6123 4567"), "Enter a Singapore mobile number starting with 8 or 9");
  assert.equal(validateSgPhone("6123 4567", { mobileOnly: false }), null);
  assert.equal(validateSgPhone("5123 4567", { mobileOnly: false }), "Enter a Singapore number starting with 3, 6, 8 or 9");
  assert.equal(validateSgPhone("+65 8123 4567"), null);
});

test("amounts parse what people type, and empty is never zero", () => {
  assert.equal(parseAmount(""), null);
  assert.equal(parseAmount("   "), null);
  assert.equal(parseAmount("25000"), 25000);
  assert.equal(parseAmount("25,000"), 25000);
  assert.equal(parseAmount("S$ 25,000.50"), 25000.5);
  assert.equal(parseAmount("SGD 1,200"), 1200);
  assert.ok(Number.isNaN(parseAmount("25k")));
  assert.ok(Number.isNaN(parseAmount("12.345")));
});

test("amounts format with thousands separators", () => {
  assert.equal(formatAmount(25000), "25,000");
  assert.equal(formatAmount(1234.5), "1,234.5");
});

test("amount validation covers missing, unreadable and out-of-range values", () => {
  assert.equal(validateAmount(""), "Enter an amount, like 25,000");
  assert.equal(validateAmount("", { required: false }), null);
  assert.equal(validateAmount("abc"), "Enter the amount in numbers only, like 25,000");
  assert.equal(validateAmount("500", { min: 1000, max: 300000 }), "Enter an amount between S$1,000 and S$300,000");
  assert.equal(validateAmount("500", { min: 1000 }), "Enter an amount of at least S$1,000");
  assert.equal(validateAmount("25,000", { min: 1000, max: 300000 }), null);
});

test("email validation", () => {
  assert.equal(validateEmail(""), "Enter your email address");
  assert.equal(validateEmail("name@"), "Enter your email in the format name@example.com");
  assert.equal(validateEmail("name@example"), "Enter your email in the format name@example.com");
  assert.equal(validateEmail(" name@example.com "), null);
});
