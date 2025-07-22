import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase";

const SistemOdasi = () => {
    const [veri, setVeri] = useState({
        sicaklik: null,
        nem: null,
        alev: null,
        su: null,
    });

    const [uyarilar, setUyarilar] = useState([]);

    useEffect(() => {
        const sensorRef = ref(rtdb, "sensor");

        const unsubscribe = onValue(sensorRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setVeri(data);
                kontrolEtUyarilar(data);
            }
        });

        return () => unsubscribe();
    }, []);

    const kontrolEtUyarilar = ({ sicaklik, nem, alev, su }) => {
        const yeniUyarilar = [];

        if (sicaklik > 35) yeniUyarilar.push("🌡️ Sıcaklık çok yüksek! (> 35°C)");
        if (nem > 70) yeniUyarilar.push("💧 Nem oranı çok yüksek! (> %70)");
        if (alev < 1800) yeniUyarilar.push("🔥 Alev algılandı! (değer < 1800)");
        else if (alev > 3500)
            yeniUyarilar.push("🔥 Alev sensör uyarısı! (değer > 3500)");
        if (su > 1000) yeniUyarilar.push("🚰 Su seviyesi çok yüksek! (> 1000)");

        setUyarilar(yeniUyarilar);
    };

    const kritikDurum = uyarilar.length > 0;
    const { sicaklik, nem, alev, su } = veri;

    return (
        <div
            style={{
                ...styles.container,
                backgroundColor: kritikDurum ? "#ffeaea" : "#f2f2f2",
            }}
        >
            <h2 style={{ ...styles.title, color: kritikDurum ? "#b00020" : "#333" }}>
                Sistem Odası
            </h2>

            {kritikDurum && (
                <div style={styles.alert}>
                    <strong>UYARI!</strong>
                    <ul style={{ marginTop: "0.7rem", paddingLeft: "1.2rem" }}>
                        {uyarilar.map((uyari, i) => (
                            <li key={i}>{uyari}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div style={styles.card}>
                <p style={styles.veriSatiri}>
                    <strong>🌡️ Sıcaklık:</strong>{" "}
                    <span style={sicaklik > 35 ? styles.redText : null}>
                        {sicaklik ?? "Yükleniyor..."} °C
                    </span>{" "}
                    <span style={styles.esikBilgi}>(Eşik: 35°C)</span>
                </p>
                <p style={styles.veriSatiri}>
                    <strong>💧 Nem:</strong>{" "}
                    <span style={nem > 70 ? styles.redText : null}>
                        {nem ?? "Yükleniyor..."} %
                    </span>{" "}
                    <span style={styles.esikBilgi}>(Eşik: %70)</span>
                </p>
                <p style={styles.veriSatiri}>
                    <strong>🔥 Alev Sensörü:</strong>{" "}
                    <span
                        style={alev < 1800 || alev > 3500 ? styles.redText : null}
                    >
                        {alev ?? "Yükleniyor..."}
                    </span>{" "}
                    <span style={styles.esikBilgi}>(Güvenli: 1800–3500)</span>
                </p>
                <p style={styles.veriSatiri}>
                    <strong>🚰 Su Seviyesi:</strong>{" "}
                    <span style={su > 1000 ? styles.redText : null}>
                        {su ?? "Yükleniyor..."}
                    </span>{" "}
                    <span style={styles.esikBilgi}>(Eşik: max 1000)</span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        backgroundColor: "#f2f2f2",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        transition: "background-color 0.5s ease",
    },
    title: {
        fontSize: "3rem",
        marginBottom: "2rem",
        textAlign: "center",
    },
    alert: {
        backgroundColor: "#ffdddd",
        color: "#b00020",
        padding: "1.5rem 2rem",
        borderRadius: "12px",
        boxShadow: "0 0 15px rgba(255, 0, 0, 0.15)",
        maxWidth: "600px",
        marginBottom: "2rem",
        textAlign: "left",
        fontSize: "1.25rem",
        fontWeight: "600",
    },
    card: {
        backgroundColor: "#fff",
        padding: "2rem 3rem",
        borderRadius: "16px",
        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
        maxWidth: "600px",
        width: "100%",
        fontSize: "1.4rem",
        lineHeight: "1.8",
    },
    redText: {
        color: "#b00020",
        fontWeight: "700",
    },
    esikBilgi: {
        fontSize: "1rem",
        color: "#777",
        marginLeft: "0.6rem",
    },
    veriSatiri: {
        marginBottom: "1.4rem",
    },
};

export default SistemOdasi;
