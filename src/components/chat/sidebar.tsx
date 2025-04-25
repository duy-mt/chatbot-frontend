import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import { createNewSession } from "../../helpers/api-communicator";
import { getListSessionbyUser, deleteSessionChat } from "../../helpers/api-communicator"

interface ChatSession {
    _id: string;
    title: string;
}

const SidebarComponent = ({ onSelectSession, activeSessionId }: { onSelectSession: (id: string) => void; activeSessionId: string | null }) => {

    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

    useEffect(() => {
        const fetchSessions = async () => {
            const sessions = await getListSessionbyUser();
            setChatSessions(sessions);
        };

        fetchSessions();
    }, []);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);

    //state dialog delete
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedSession(id);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedSession(null);
    };

    const handleDelete = () => {
        setIsConfirmDialogOpen(true);
    };

    // Confirm && Cancel Delete
    const confirmDelete = async () => {
        console.log("Delete confirmed for session:", selectedSession);
        // Thực hiện xóa session ở đây
        setChatSessions((prev) => prev.filter(s => s._id !== selectedSession));
        await deleteSessionChat(selectedSession);
        setIsConfirmDialogOpen(false);
        handleCloseMenu();
    };

    const cancelDelete = async () => {
        setIsConfirmDialogOpen(false);
        handleCloseMenu();
    };

    const handleAddFolder = () => {
        console.log("Add folder to session:", selectedSession);
        handleCloseMenu();
    };

    const handleNewChatSession = async () => {
        try {
            const newSession = await createNewSession(); // phải chờ kết quả
            if (newSession) {
                setChatSessions((prev) => [newSession.session, ...prev]); // thêm session mới vào danh sách
                onSelectSession(newSession.session._id.toString()); // chuyển sang session mới tạo
            }
        } catch (error) {
            console.error("Failed to create new session", error);
        }
    };

    return (
        <Box
            sx={{
                width: isSidebarOpen ? 280 : 60,
                height: "78vh",
                bgcolor: "rgb(17,29,39)",
                p: 2,
                display: "flex",
                flexDirection: "column",
                transition: "width 0.3s",
                overflowY: "auto",
                borderRadius: 3,
                scrollBsehavior: "smooth",
                // Custom scroll
                "&::-webkit-scrollbar": {
                    width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#555555",
                    borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#888888",
                },
            }}
        >
            {/* Toggle Button and New Chat Button */}
            <Box sx={{ display: "flex", justifyContent: isSidebarOpen ? "space-between" : "center", mb: 2 }}>
                <IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
                    <span style={{ fontSize: "20px" }}>☰</span>
                </IconButton>

                {isSidebarOpen && (
                    <IconButton onClick={handleNewChatSession} sx={{ color: "white" }}>
                        <span style={{ fontSize: "30px" }}>+</span>
                    </IconButton>
                )}
            </Box>

            {/* Title */}
            {isSidebarOpen && (
                <Typography
                    variant="h6"
                    sx={{
                        color: "white",
                        textAlign: "center",
                        fontFamily: "Work Sans",
                        mb: 2,
                    }}
                >
                    Chat Sessions
                </Typography>
            )}

            {/* Chat list */}
            <List>
                {chatSessions.map(session => (
                    <ListItem
                        key={session._id}
                        // button
                        onClick={() => onSelectSession(session._id)}
                        sx={{
                            borderRadius: 5,
                            px: 2,
                            bgcolor: session._id === activeSessionId ? "rgba(255,255,255,0.1)" : "transparent",
                            "&:hover": {
                                bgcolor:
                                    session._id === activeSessionId ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.08)",
                            }
                        }}
                        secondaryAction={
                            isSidebarOpen && (
                                <IconButton
                                    edge="end"
                                    onClick={(e) => handleOpenMenu(e, session._id)}
                                    sx={{ color: "white" }}
                                >
                                    {/* <MoreVertIcon /> */}
                                    <span style={{ fontSize: "20px" }}>⋮</span>
                                </IconButton>
                            )
                        }
                    >
                        <ListItemText
                            primary={isSidebarOpen ? session.title : session.title}
                            primaryTypographyProps={{
                                sx: { color: "white", textAlign: isSidebarOpen ? "left" : "center" },
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        bgcolor: "#343541",
                        color: "#fff",
                    },
                }}
            >
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
                {/* <MenuItem onClick={handleAddFolder}>Add folder</MenuItem> */}
            </Menu>
            <Dialog
                open={isConfirmDialogOpen}
                onClose={cancelDelete}
            >
                <DialogTitle>Xác nhận xoá</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this chat session? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={confirmDelete} color="primary">
                        Confirm
                    </Button>
                    <Button onClick={cancelDelete} color="error" autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SidebarComponent;
