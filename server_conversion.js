const loggingStream = new TransformStream({
  transform(chunk, controller) {
    const decodedData = new TextDecoder().decode(chunk);
    console.log("RecievedData on Server side", decodedData);
    controller.enqueue(decodedData);
  },
});

const stringify = (objs) => JSON.stringify(objs);

const jsonObject = (objs) => JSON.parse(objs);

const conversion = (obj) => {
  switch (obj) {
    case obj.from === "Km" && obj.to === "m":
      return { result: obj.value * 1000 };
  }
};

const JsonStringify = new TransformStream({
  transform(chunk, controller) {
    const obj = jsonObject(chunk);
    const resolve = conversion(obj);
    console.log("jsonObject", obj);
    const string = stringify("78000");
    controller.enqueue(string);
  },
});

const operationalStream = new TransformStream({
  transform(chunk, controller) {
    const encodedData = new TextEncoder().encode(chunk);
    controller.enqueue(encodedData);
  },
});

const main = async () => {
  const conn = Deno.listen({ port: 8000 });
  for await (const connection of conn) {
    await connection.readable
      .pipeThrough(loggingStream)
      .pipeThrough(JsonStringify)
      .pipeThrough(operationalStream)
      .pipeTo(connection.writable);
  }
};

main();
