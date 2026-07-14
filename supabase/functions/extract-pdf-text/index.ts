import "@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  try {
    const { file } = await req.json();

    if (!file) {
      return new Response(JSON.stringify({ error: "Missing file data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const binaryString = atob(file);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/+esm");
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      text += pageText + "\n";
    }

    return new Response(JSON.stringify({ text: text.trim() }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
