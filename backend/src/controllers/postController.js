import Post from "../models/post.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "../middlewares.js";
import User from"../models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createPost = (req, res) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    
    const { title, content} = req.body;
    const author_id = req.session.user.id;
    if (!req.file) {
        return res.status(400).json({ message: "Imaginea este obligatorie!" });
    }
    
    const image_url = `/uploads/${req.file.filename}`;

    if (!title || !author_id) {
        return res.status(400).json({ message: "Campurile titlu si user sunt obligatorii!" });
    }

    Post.create(title, content || '', author_id, image_url, (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err });
        }
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(201).json({ message: "Postare creata cu succes!" });
        } else {
            res.redirect('/my-posts');
        }
    });
};


export const deletePost = (req, res) => {
    const { id } = req.body; 
  
    if (!id) {
      return res.status(400).json({ error: "Id-ul postarii este obligatoriu!" });
    }
  
  
    Post.delete(id, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Eroare la stergerea din baza de date" });
        }
        
        
        if (result && result.affectedRows && result.affectedRows > 0) {
            return res.status(200).json({ 
                message: "Postare stearsa cu succes!",
                success: true 
            });
        } else {
            return res.status(404).json({ 
                error: "Postarea nu a fost gasita" 
            });
        }
    });
};

export const updateTitle = (req, res) => {
    const { id, title } = req.body;
    if (!id || !title) {
      return res.status(400).json({ message: "ID si titlu obligatorii!" });
    }
  
    Post.updateTitle(id, title, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (!result) return res.status(404).json({ message: "Postarea nu exista!" });
      res.json({ message: "Titlul a fost actualizat!" });
    });
};

export const updateContent = (req, res) => {
    const {id, content} = req.body;
    if(!id || !content){
        return res.status(400).json({ message: "ID și continut obligatorii!" });
    }
    Post.updateContent(id, content, (err, result) => {
        if(err) return res.status(500).json({error: err});
        if(!result) return res.status(404).json({ message: "Postarea nu exista!" });
        res.json({ message: "Continutul a fost actualizat!" });
    });
};

export const getPosts = (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;
    let offset = (page - 1) * limit;

    Post.getAll(offset, limit, (err, posts) => {
        if (err) return res.status(500).json({ error: err });
        res.json(posts);
    });
};

export const postsUser=(req,res)=>{
    let page=parseInt(req.query.page)||1;
    let limit = parseInt(req.query.limit) || 5;
    let offset = (page - 1) * limit;
    let username=req.params.username;
    console.log(req.query.username)
    User.findByUsername(username, (err, user) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (!user) return res.status(404).json({ error: "User not found" });
    
        Post.findByUser(user.getId(), offset, limit, (err, posts) => {
          if (err) return res.status(500).json({ error: "Server error" });
          res.json(posts);
        });
    });
};

export const myPosts = (req, res) => {
    if (!req.session || !req.session.user) {
      console.log("⚠️ Nu există sesiune sau user în sesiune:", req.session);
      return res.status(401).json({ error: "Neautorizat" });
    }
  
    const author_id = req.session.user.id;
    console.log(author_id);
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 5;
    let offset = (page - 1) * limit;
  
    console.log("myPosts ->", { author_id, page, limit, offset });
  
    Post.findByUser(author_id, offset, limit, (err, posts) => {
      if (err) {
        console.error("❌ Eroare DB:", err);
        return res.status(500).json({ error: "Server error" });
      }
  
      console.log("✅ Postări găsite:", posts);
      res.json(posts || []); // niciodată undefined
    });
  };
  
  


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      
        const uploadsPath = path.join(__dirname, "../../../frontend/public/uploads");
        console.log('Upload path:', uploadsPath);
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Doar fișierele imagine sunt permise!'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;