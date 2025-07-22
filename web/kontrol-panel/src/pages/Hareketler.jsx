import React, { useEffect, useState } from "react";
import {
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Button,
    Stack,
    Box,
} from "@mui/material";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

function Hareketler() {
    const [hareketler, setHareketler] = useState([]);
    const [filtered, setFiltered] = useState([]);


    const [arama, setArama] = useState("");
    const [yetkiFilter, setYetkiFilter] = useState("hepsi");
    const [islemFilter, setIslemFilter] = useState("hepsi");

    const [startDateFilter, setStartDateFilter] = useState(null);
    const [endDateFilter, setEndDateFilter] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const q = query(collection(db, "Hareketler"), orderBy("tarih_saat", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => doc.data());
            setHareketler(data);
            setFiltered(data);
        };
        fetchData();
        const intervalId = setInterval(() => {
            fetchData(); // her 10 saniyede bir yenile
        }, 10000); // 10000 ms = 10 saniye

        return () => clearInterval(intervalId); // component unmount olunca interval temizle
    }, []);

    const getYetkiBackground = (yetki) => {
        switch (yetki) {
            case "yetkili":
                return "#e8f5e9"; // açık yeşil
            case "yetkisiz":
                return "#ffebee"; // açık kırmızı
            case "kayıtlı değil":
                return "#fff8e1"; // açık sarı
            default:
                return "#ffffff";
        }
    };


    useEffect(() => {
        let temp = [...hareketler];

        if (arama.trim()) {
            temp = temp.filter(
                (item) =>
                    item.uid.toLowerCase().includes(arama.toLowerCase()) ||
                    item.kullanici?.toLowerCase().includes(arama.toLowerCase())
            );
        }

        if (yetkiFilter !== "hepsi") {
            temp = temp.filter((item) => item.yetki === yetkiFilter);
        }

        if (islemFilter !== "hepsi") {
            temp = temp.filter((item) => item.islem === islemFilter);
        }

        if (startDate) {
            temp = temp.filter((item) => new Date(item.tarih_saat) >= startDate);
        }

        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            temp = temp.filter((item) => new Date(item.tarih_saat) <= endOfDay);
        }

        setFiltered(temp);
    }, [arama, yetkiFilter, islemFilter, startDate, endDate, hareketler]);

    const applyQuickFilter = (type) => {
        const now = new Date();
        let start = null,
            end = null;

        switch (type) {
            case "bugun":
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case "sonhafta":
                end = now;
                start = new Date(now);
                start.setDate(start.getDate() - 7);
                break;
            case "sonay":
                end = now;
                start = new Date(now);
                start.setMonth(start.getMonth() - 1);
                break;
            default:
                break;
        }

        setStartDateFilter(start);
        setEndDateFilter(end);
        setStartDate(start);
        setEndDate(end);
    };

    const applyDateFilter = () => {
        setStartDate(startDateFilter);
        setEndDate(endDateFilter);
    };

    const getYetkiColor = (yetki) => {
        switch (yetki) {
            case "yetkili":
                return "#2e7d32"; // açık yeşil
            case "yetkisiz":
                return "#d32f2f"; // açık kırmızı
            case "kayıtlı değil":
                return "#f9a825"; // sarı
            default:
                return "#555";
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box

                sx={{
                    mt: 7,
                    mx: "auto",
                    backgroundColor: "#e3f2fd",
                    minHeight: "92vh",

                }}
            >
                <Box
                    sx={{
                        maxWidth: 1400, // İstersen px veya % olarak ayarlayabilirsin
                        mx: "auto",
                        px: 2,        // İçeride biraz yandan boşluk
                        py: 2,        // Üst-alt boşluk
                    }}
                >
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ color: "#1a237e", fontWeight: "bold", pt: 3 }}
                    >
                        Giriş - Çıkış Kayıtları
                    </Typography>

                    <Paper elevation={2} sx={{ padding: 3, marginBottom: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Arama (UID / Kullanıcı)"
                                    fullWidth
                                    value={arama}
                                    onChange={(e) => setArama(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={6} sm={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Yetki</InputLabel>
                                    <Select
                                        value={yetkiFilter}
                                        label="Yetki"
                                        onChange={(e) => setYetkiFilter(e.target.value)}
                                    >
                                        <MenuItem value="hepsi">Hepsi</MenuItem>
                                        <MenuItem value="yetkili">Yetkili</MenuItem>
                                        <MenuItem value="yetkisiz">Yetkisiz</MenuItem>
                                        <MenuItem value="kayıtlı değil">Kayıtlı Değil</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={6} sm={2}>
                                <FormControl fullWidth>
                                    <InputLabel>İşlem</InputLabel>
                                    <Select
                                        value={islemFilter}
                                        label="İşlem"
                                        onChange={(e) => setIslemFilter(e.target.value)}
                                    >
                                        <MenuItem value="hepsi">Hepsi</MenuItem>
                                        <MenuItem value="giriş">Giriş</MenuItem>
                                        <MenuItem value="çıkış">Çıkış</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={6} sm={2}>
                                <DatePicker
                                    label="Başlangıç Tarihi"
                                    value={startDateFilter}
                                    onChange={setStartDateFilter}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </Grid>

                            <Grid item xs={6} sm={2}>
                                <DatePicker
                                    label="Bitiş Tarihi"
                                    value={endDateFilter}
                                    onChange={setEndDateFilter}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12}>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Button variant="contained" onClick={applyDateFilter}>
                                        Uygula
                                    </Button>
                                    <Button variant="outlined" onClick={() => applyQuickFilter("bugun")} size="small">
                                        Bugün
                                    </Button>
                                    <Button variant="outlined" onClick={() => applyQuickFilter("sonhafta")} size="small">
                                        Son Hafta
                                    </Button>
                                    <Button variant="outlined" onClick={() => applyQuickFilter("sonay")} size="small">
                                        Son Ay
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setStartDateFilter(null);
                                            setEndDateFilter(null);
                                            setStartDate(null);
                                            setEndDate(null);
                                        }}
                                        size="small"
                                    >
                                        Temizle
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ width: "100%", overflowX: "auto", borderRadius: 3 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: '#1874CD', color: 'white' }}><strong>UID</strong></TableCell>
                                    <TableCell sx={{ backgroundColor: '#1874CD', color: 'white' }}><strong>Kullanıcı</strong></TableCell>
                                    <TableCell sx={{ backgroundColor: '#1874CD', color: 'white' }}><strong>Meslek</strong></TableCell>
                                    <TableCell sx={{ backgroundColor: '#1874CD', color: 'white' }}><strong>Yetki</strong></TableCell>
                                    <TableCell sx={{ backgroundColor: '#1874CD', color: 'white' }}><strong>İşlem</strong></TableCell>
                                    <TableCell sx={{ backgroundColor: '#1874CD', color: 'white' }}><strong>Kaynak</strong></TableCell>
                                    <TableCell sx={{ backgroundColor: '#1874CD', color: 'white' }}><strong>Tarih / Saat</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Kayıt bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((item, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                backgroundColor: getYetkiBackground(item.yetki),
                                                transition: "background-color 0.3s ease",
                                            }}
                                        >
                                            <TableCell>{item.uid}</TableCell>
                                            <TableCell>{item.kullanici || "-"}</TableCell>
                                            <TableCell>{item.meslek || "-"}</TableCell>
                                            <TableCell sx={{ color: getYetkiColor(item.yetki), fontWeight: "bold" }}>
                                                {item.yetki}
                                            </TableCell>
                                            <TableCell>{item.islem}</TableCell>
                                            <TableCell>{item.kaynak}</TableCell>
                                            <TableCell>{item.tarih_saat}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>

                        </Table>
                    </Paper>
                </Box>
            </Box>
        </LocalizationProvider>
    );
}

export default Hareketler;
