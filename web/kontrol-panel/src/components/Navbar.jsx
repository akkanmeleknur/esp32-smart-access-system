import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

function Navbar() {
    const location = useLocation();

    console.log("Current path:", location.pathname); // buraya bak

    const navItems = [
        { label: "Hareketler", path: "/" },
        { label: "Kartlar", path: "/kartlar" },
        { label: "Sistem Odası", path: "/sistemodasi" }, // veya /sistemodasi
    ];

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: "#0d47a1",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
        >
            <Toolbar sx={{ px: 3, height: 64 }}>
                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 600,
                        letterSpacing: 1,
                        color: "#fff",
                    }}
                >
                    Kontrol Sistemi
                </Typography>

                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Button
                            key={item.path}
                            component={RouterLink}
                            to={item.path}
                            color="inherit"
                            sx={{
                                color: isActive ? "#ffd54f" : "#fff",
                                fontWeight: isActive ? 600 : 400,
                                textTransform: "none",
                                mx: 1,
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                    color: "greenyellow",
                                },
                            }}
                        >
                            {item.label}
                        </Button>
                    );
                })}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
