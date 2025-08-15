"use client";

import Image from "next/image";
import styles from "@/app/styles/modificar.module.css";
import { FiCamera } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Modificar() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [juego, setJuego] = useState(null);
  const [plataformas, setPlataformas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/games/${id}`);
        setJuego(data);
        setImagePreview(data.cover);
      } catch (err) {
        console.error("Error al obtener videojuego:", err);
      }

      try {
        const [platData, catData] = await Promise.all([
          axios.get("/api/platforms"),
          axios.get("/api/categories"),
        ]);
        setPlataformas(platData.data);
        setCategorias(catData.data);
      } catch (err) {
        console.error("Error al obtener plataformas/categorías:", err);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    setJuego({ ...juego, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJuego({ ...juego, cover: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleModificar = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", juego.title);
      formData.append("platform_id", juego.platform_id);
      formData.append("category_id", juego.category_id);
      formData.append("year", juego.year);

      if (juego.cover instanceof File) {
        formData.append("cover", juego.cover);
      }

      console.log("📦 Enviando a backend:", [...formData.entries()]);

      await axios.put(`/api/games/${id}`, formData);
      alert("Juego modificado exitosamente");
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Error al modificar:", error);
      alert("Error al modificar. Verifica consola.");
    }
  };

  if (!juego) return <p>Cargando...</p>;

  return (
    <div className={styles.modificar}>
      <div className={styles.topBar}>
        <h1 className={styles.titulo}>
          <span className={styles.tituloParte1}>Modificar</span>{" "}
          <span className={styles.tituloParte2}>VideoJuego</span>
        </h1>
        <button
          className={styles.closeBtn}
          onClick={() => router.push("/dashboard")}
        >
          ✕
        </button>
      </div>

      <Image
        src={
          typeof imagePreview === "string"
            ? imagePreview
            : URL.createObjectURL(imagePreview)
        }
        alt="Portada"
        width={180}
        height={180}
        className={styles.juegoImagen}
      />

      <div className={styles.inputGroup}>
        <input
          type="text"
          className={styles.input}
          name="title"
          value={juego.title}
          onChange={handleInputChange}
        />

        <select
          className={styles.select}
          name="platform_id"
          value={juego.platform_id}
          onChange={handleInputChange}
        >
          {plataformas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          name="category_id"
          value={juego.category_id}
          onChange={handleInputChange}
        >
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className={styles.fileInputLabel}>
          Cambiar Portada
          <FiCamera className={styles.iconoCamaraDerecha} />
          <input
            type="file"
            className={styles.fileInput}
            onChange={handleImageChange}
          />
        </label>

        <input
          className={styles.input}
          name="year"
          value={juego.year}
          onChange={handleInputChange}
          placeholder="Año de lanzamiento"
        />

        <button className={styles.boton} onClick={handleModificar}>
          Modificar
        </button>
      </div>
    </div>
  );
}
