

import http from "node:http";
import fs from "node:fs";
import path from "node:path";


const filePath = path.join(process.cwd(), "books.json")


if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]))
}


const getAllBooks = async () => {
  const data = await fs.promises.readFile(filePath, "utf8")
  return JSON.parse(data)
};


const saveBooks = async (books) => {
  await fs.promises.writeFile(filePath, JSON.stringify(books, null, 2))
};


const server = http.createServer(async (req, res) => {
  const method = req.method.toLowerCase();
  const url = req.url;

  console.log({ method, url });

  if (method === "get" && url === "/books") {
    try {
      const books = await getAllBooks();
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(books))
    } catch {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Server xatosi" }))
    }
 

} 
else if (method === "get" && url.startsWith("/books/")) {
    try {
      const id = url.slice(7); 
      const books = await getAllBooks()
      const book = books.find(b => b.id === id)
      if (!book) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Kitob topilmadi" }))
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(book))
    } catch {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Server xatosi" }))

    }

} else if (method === "post" && url === "/books") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { title, author, year } = JSON.parse(body);
        if (!title || !author || !year) {
          res.writeHead(400, { "Content-Type": "application/json" })
          return res.end(JSON.stringify({ message: "title, author va year majburiy" }))
        }
        const books = await getAllBooks();
        const newBook = { id: Math.random().toString(36).substr(2, 9), title, author, year }
        books.push(newBook)
        await saveBooks(books)
        res.writeHead(201, { "Content-Type": "application/json" })
        res.end(JSON.stringify(newBook))
      } 
      catch {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Invalid JSON" }))
      }
    });

} 
else if (method === "put" && url.startsWith("/books/")) {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", async () => {
    try {
      const updatedData = JSON.parse(body)
      const id = parseInt(url.slice(7))

      const books = await getAllBooks()
      const index = books.findIndex(b => b.id === id)

      if (index === -1) {
        res.writeHead(404, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ message: "Kitob topilmadi" }))
        
      }

      books[index] = { ...books[index], ...updatedData }
      await saveBooks(books)

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(books[index]));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Invalid JSON" }))
    }

  })
}
else if (method === "delete" && url.startsWith("/books/")) {
  const id = parseInt(url.slice(7))
  const books = await getAllBooks()
  const index = books.findIndex(b => b.id === id)

  if (index === -1) {
    res.writeHead(404, { "Content-Type": "application/json" })
    return res.end(JSON.stringify({ message: "Kitob topilmadi" }))
  }

  books.splice(index, 1)
  await saveBooks(books)

  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ message: "Kitob o‘chirildi" }))
}

else {
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "API not found" }))
  }
});

server.listen(3000, () => {
    console.log("Server running on port 3000")
})
