import { assertEquals } from "@std/assert";

const isValidUnit = (unit) => {
  const validUnits = new Set([
    "km",
    "miles",
    "m",
    "feet",
    "celsius",
    "fahrenheit",
    "kg",
    "pounds",
  ]);

  return validUnits.has(unit);
};

const isUnitsRangeIsFine = (units, num) => {
  if (units.length !== num) {
    throw new Error("UNITS LENGTH ARE NOT ENOUGH");
  }

  if (!units.every(isValidUnit)) {
    throw new Error("Unsupported Units");
  }

  return { from: units[0], to: units[1] };
};

const makeObject = (units, value) => {
  try {
    const unitRange = isUnitsRangeIsFine(units, 2);
    if (typeof value !== "number") {
      throw new Error("values are Not valid");
    }

    return { ...unitRange, value };
  } catch (error) {
    console.log(error.message);
  }
};

const handler = async (writter, reader, units, values, expected) => {
  const stringResponse = JSON.stringify(makeObject(units, values));
  await writter.write(new TextEncoder().encode(stringResponse));
  const data = await reader.read();
  const response = new TextDecoder().decode(data.value);
  const responseInFormat = JSON.parse(response);
  console.log(responseInFormat);
  assertEquals(responseInFormat, expected);
};

const main = async () => {
  const conn = await Deno.connect({ port: 8000 });
  const writter = conn.writable.getWriter();
  const reader = conn.readable.getReader();
  handler(writter, reader, ["km", "m"], 78, { result: 78000 });
  handler(writter, reader, ["km", "m"], 8, { result: 8000 });
  handler(writter, reader, ["km", "m", "pound"], 89, { default: 7900 });
  handler(writter, reader, ["km", "ms"], 89, { default: 7900 });
  // handler(writter, reader, ["pounds", "m"], 78, 78000);
};

main();
