import React, { useEffect, useState } from "react";
import {
    Typography,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Checkbox,
    IconButton,
    Stack,
    Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

function Kartlar() {
    const [kartlar, setKartlar] = useState([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentDocId, setCurrentDocId] = useState(null);

    const [uid, setUid] = useState("");
    const [kullanici, setKullanici] = useState("");
    const [meslek, setMeslek] = useState("");
    const [yetki, setYetki] = useState(false);

    useEffect(() => {
        fetchKartlar();
    }, []);

    const fetchKartlar = async () => {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "Kartlar"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setKartlar(data);
        setLoading(false);
    };

    const openAddDialog = () => {
        setEditMode(false);
        setUid("");
        setKullanici("");
        setMeslek("");
        setYetki(false);
        setOpen(true);
    };

    const openEditDialog = (kart) => {
        setEditMode(true);
        setCurrentDocId(kart.id);
        setUid(kart.id);
        setKullanici(kart.Kullanıcı || "");
        setMeslek(kart.Meslek || "");
        setYetki(kart.Yetki || false);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        if (!uid.trim()) {
            alert("UID boş olamaz!");
            return;
        }

        const kartData = {
            Kullanıcı: kullanici,
            Meslek: meslek,
            Yetki: yetki,
        };

        try {
            if (editMode) {
                const ref = doc(db, "Kartlar", currentDocId);
                await updateDoc(ref, kartData);
            } else {
                const ref = doc(db, "Kartlar", uid);
                await setDoc(ref, kartData);
            }
            fetchKartlar();
            setOpen(false);
        } catch (error) {
            console.error("Kaydetme hatası:", error);
            alert("Hata oluştu!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "Kartlar", id));
                fetchKartlar();
            } catch (error) {
                console.error("Silme hatası:", error);
                alert("Silme sırasında hata oluştu!");
            }
        }
    };

    const renderYetkiText = (yetki) => {
        if (yetki === "kayıtlı değil") {
            return <span style={{ color: "#fbc02d", fontWeight: 600 }}>Kayıtlı Değil</span>;
        }
        return (
            <span style={{
                color: yetki ? "#4caf50" : "#f44336",
                fontWeight: 600
            }}>
                {yetki ? "Yetkili" : "Yetkisiz"}
            </span>
        );
    };

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#fce4ec", // Pembe arkaplan
            }}
        >
            <Box sx={{ width: "100%", maxWidth: 950 }}>
                <Typography
                    variant="h4"
                    align="center"
                    sx={{ mb: 4, fontWeight: "bold", color: "#283593" }}
                >
                    Kartlar
                </Typography>

                <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        onClick={openAddDialog}
                        sx={{
                            backgroundColor: "#283593",
                            "&:hover": { backgroundColor: "#1a237e" },
                            px: 3, py: 1.2, fontWeight: 600
                        }}
                    >
                        Yeni Kart Ekle
                    </Button>
                </Box>

                <Paper elevation={5} sx={{ borderRadius: 4, overflow: "hidden" }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f8bbd0" }}>
                            <TableRow>
                                <TableCell><strong>UID (ID)</strong></TableCell>
                                <TableCell><strong>Kullanıcı</strong></TableCell>
                                <TableCell><strong>Meslek</strong></TableCell>
                                <TableCell><strong>Yetki</strong></TableCell>
                                <TableCell><strong>İşlemler</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!loading && kartlar.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Kayıt bulunamadı.
                                    </TableCell>
                                </TableRow>
                            )}
                            {kartlar.map((kart) => (
                                <TableRow key={kart.id} hover>
                                    <TableCell>{kart.id}</TableCell>
                                    <TableCell>{kart.Kullanıcı}</TableCell>
                                    <TableCell>{kart.Meslek}</TableCell>
                                    <TableCell>{renderYetkiText(kart.Yetki)}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => openEditDialog(kart)}
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(kart.id)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle sx={{ backgroundColor: "#f8bbd0" }}>
                        {editMode ? "Kart Düzenle" : "Yeni Kart Ekle"}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 1, minWidth: 400 }}>
                        <TextField
                            label="UID"
                            value={uid}
                            onChange={(e) => setUid(e.target.value.trim())}
                            fullWidth
                            margin="normal"
                            disabled={editMode}
                        />
                        <TextField
                            label="Kullanıcı Adı"
                            value={kullanici}
                            onChange={(e) => setKullanici(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Meslek"
                            value={meslek}
                            onChange={(e) => setMeslek(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={yetki}
                                    onChange={(e) => setYetki(e.target.checked)}
                                />
                            }
                            label="Yetkili"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>İptal</Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            sx={{
                                backgroundColor: "#d81b60",
                                "&:hover": { backgroundColor: "#ad1457" },
                            }}
                        >
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

export default Kartlar;
