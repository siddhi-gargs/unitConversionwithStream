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
  if (obj.from === "km" && obj.to === "m") {
    return { result: obj.value * 1000 };
  }
  return { default: 5000 };
};

const JsonStringify = new TransformStream({
  transform(chunk, controller) {
    const obj = jsonObject(chunk);
    const resolve = conversion(obj);

    const string = stringify(resolve);
    controller.enqueue(string);
  },
});

const operationalStream = new TransformStream({
  transform(chunk, controller) {
    console.log("data has to write from server to client ...");
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
