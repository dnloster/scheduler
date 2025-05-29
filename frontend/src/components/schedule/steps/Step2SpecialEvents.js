import React from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    FormControlLabel,
    Checkbox,
    FormControl,
    RadioGroup,
    Radio,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Event as EventIcon, Warning as WarningIcon } from "@mui/icons-material";
import dayjs from "dayjs";

const Step2SpecialEvents = ({
    filteredEvents,
    eventsData,
    setEventsData,
    customEvents,
    setCustomEvents,
    newEventName,
    setNewEventName,
    newEventDate,
    setNewEventDate,
    newEventDuration,
    setNewEventDuration,
    handleAddCustomEvent,
    handleRemoveCustomEvent,
    formatDate,
}) => {
    return (
        <Box>
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #ff9800" }}>
                <Typography variant="h6" gutterBottom color="warning.main">
                    Sự kiện định kỳ cố định
                </Typography>
                <Grid container spacing={2}>
                    {filteredEvents
                        .filter(
                            (event) =>
                                event.type === "periodic" &&
                                (event.name.toLowerCase().includes("chào cờ") ||
                                    event.name.toLowerCase().includes("bảo quản") ||
                                    event.name.toLowerCase().includes("ngày nhà giáo") ||
                                    event.recurring_pattern)
                        )
                        .map((event) => (
                            <Grid item xs={12} md={6} key={event._id}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={event.selected !== false}
                                            onChange={(e) => {
                                                setEventsData(
                                                    eventsData.map((e) =>
                                                        e._id === event._id
                                                            ? {
                                                                  ...e,
                                                                  selected: e.selected === false ? true : false,
                                                              }
                                                            : e
                                                    )
                                                );
                                            }}
                                            color="warning"
                                        />
                                    }
                                    label={event.name + (event.description ? ` (${event.description})` : "")}
                                />
                            </Grid>
                        ))}
                    {filteredEvents.filter(
                        (event) =>
                            event.type === "periodic" &&
                            (event.name.toLowerCase().includes("chào cờ") ||
                                event.name.toLowerCase().includes("bảo quản") ||
                                event.name.toLowerCase().includes("ngày nhà giáo") ||
                                event.recurring_pattern)
                    ).length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                Không có sự kiện định kỳ cố định nào từ cơ sở dữ liệu
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #673ab7" }}>
                <Typography variant="h6" gutterBottom sx={{ color: "#673ab7" }}>
                    Sự kiện đặc biệt có ngày cụ thể
                </Typography>
                <Grid container spacing={2}>
                    {filteredEvents
                        .filter(
                            (event) =>
                                (event.type === "periodic" &&
                                    !event.name.toLowerCase().includes("chào cờ") &&
                                    !event.name.toLowerCase().includes("bảo quản") &&
                                    !event.name.toLowerCase().includes("ngày nhà giáo") &&
                                    !event.recurring_pattern) ||
                                event.type === "special"
                        )
                        .map((event) => (
                            <Grid item xs={12} md={6} key={event._id}>
                                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={event.selected !== false}
                                                onChange={(e) => {
                                                    setEventsData(
                                                        eventsData.map((e) =>
                                                            e._id === event._id
                                                                ? {
                                                                      ...e,
                                                                      selected: e.selected === false ? true : false,
                                                                  }
                                                                : e
                                                        )
                                                    );
                                                }}
                                                sx={{ color: "#673ab7" }}
                                            />
                                        }
                                        label={<Typography fontWeight="medium">{event.name}</Typography>}
                                    />
                                    <Grid container spacing={2} sx={{ mt: 1, pl: 4 }}>
                                        <Grid item xs={12}>
                                            <FormControl component="fieldset">
                                                <RadioGroup
                                                    row
                                                    name="timeConfigType"
                                                    value={event.timeConfigType || "single"}
                                                    onChange={(e) => {
                                                        setEventsData(
                                                            eventsData.map((ev) =>
                                                                ev._id === event._id
                                                                    ? {
                                                                          ...ev,
                                                                          timeConfigType: e.target.value,
                                                                      }
                                                                    : ev
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value="single"
                                                        control={<Radio size="small" />}
                                                        label="Ngày cụ thể"
                                                    />
                                                    <FormControlLabel
                                                        value="range"
                                                        control={<Radio size="small" />}
                                                        label="Khoảng thời gian"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                        {(event.timeConfigType || "single") === "single" ? (
                                            <Grid item xs={12} md={6}>
                                                <DatePicker
                                                    label="Ngày diễn ra"
                                                    value={event.date ? dayjs(event.date) : null}
                                                    onChange={(newValue) => {
                                                        setEventsData(
                                                            eventsData.map((e) =>
                                                                e._id === event._id
                                                                    ? {
                                                                          ...e,
                                                                          date: newValue
                                                                              ? newValue.format("YYYY-MM-DD")
                                                                              : null,
                                                                          start_date: newValue
                                                                              ? newValue.format("YYYY-MM-DD")
                                                                              : null,
                                                                          end_date:
                                                                              newValue && event.duration_days > 1
                                                                                  ? newValue
                                                                                        .add(
                                                                                            event.duration_days - 1,
                                                                                            "day"
                                                                                        )
                                                                                        .format("YYYY-MM-DD")
                                                                                  : newValue
                                                                                  ? newValue.format("YYYY-MM-DD")
                                                                                  : null,
                                                                      }
                                                                    : e
                                                            )
                                                        );
                                                    }}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            helperText: "Chọn ngày bắt đầu sự kiện",
                                                            required: true,
                                                            size: "small",
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                        ) : (
                                            <>
                                                <Grid item xs={12} md={6}>
                                                    <DatePicker
                                                        label="Ngày bắt đầu"
                                                        value={event.start_date ? dayjs(event.start_date) : null}
                                                        onChange={(newValue) => {
                                                            setEventsData(
                                                                eventsData.map((e) =>
                                                                    e._id === event._id
                                                                        ? {
                                                                              ...e,
                                                                              start_date: newValue
                                                                                  ? newValue.format("YYYY-MM-DD")
                                                                                  : null,
                                                                              date: newValue
                                                                                  ? newValue.format("YYYY-MM-DD")
                                                                                  : null,
                                                                          }
                                                                        : e
                                                                )
                                                            );
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                helperText: "Chọn ngày bắt đầu sự kiện",
                                                                required: true,
                                                                size: "small",
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <DatePicker
                                                        label="Ngày kết thúc"
                                                        value={event.end_date ? dayjs(event.end_date) : null}
                                                        onChange={(newValue) => {
                                                            const startDate = event.start_date
                                                                ? dayjs(event.start_date)
                                                                : null;
                                                            const endDate = newValue;
                                                            let durationDays = 1;

                                                            if (startDate && endDate) {
                                                                durationDays = endDate.diff(startDate, "day") + 1;
                                                                if (durationDays < 1) durationDays = 1;
                                                            }

                                                            setEventsData(
                                                                eventsData.map((e) =>
                                                                    e._id === event._id
                                                                        ? {
                                                                              ...e,
                                                                              end_date: newValue
                                                                                  ? newValue.format("YYYY-MM-DD")
                                                                                  : null,
                                                                              duration_days: durationDays,
                                                                          }
                                                                        : e
                                                                )
                                                            );
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                helperText: "Chọn ngày kết thúc sự kiện",
                                                                required: true,
                                                                size: "small",
                                                            },
                                                        }}
                                                        minDate={event.start_date ? dayjs(event.start_date) : undefined}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Số ngày"
                                                type="number"
                                                value={event.duration_days || 1}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 1;
                                                    setEventsData(
                                                        eventsData.map((ev) =>
                                                            ev._id === event._id
                                                                ? {
                                                                      ...ev,
                                                                      duration_days: value < 1 ? 1 : value,
                                                                  }
                                                                : ev
                                                        )
                                                    );
                                                }}
                                                fullWidth
                                                InputProps={{ inputProps: { min: 1 } }}
                                                size="small"
                                                disabled={(event.timeConfigType || "single") === "range"}
                                                helperText={
                                                    (event.timeConfigType || "single") === "range"
                                                        ? "Số ngày được tính tự động từ khoảng thời gian"
                                                        : ""
                                                }
                                            />
                                        </Grid>
                                    </Grid>{" "}
                                    {event.selected !== false && event.duration_days > 1 && (
                                        <Box mt={2} p={1} bgcolor="rgba(103, 58, 183, 0.1)" borderRadius={1}>
                                            <Typography variant="caption" display="block">
                                                <strong>Tóm tắt:</strong> Sự kiện sẽ diễn ra trong {event.duration_days}{" "}
                                                ngày, từ{" "}
                                                {formatDate(event.date) ||
                                                    formatDate(event.start_date) ||
                                                    "(chưa chọn)"}{" "}
                                                đến{" "}
                                                {event.end_date
                                                    ? formatDate(event.end_date)
                                                    : event.date && event.duration_days > 1
                                                    ? formatDate(
                                                          dayjs(event.date)
                                                              .add(event.duration_days - 1, "day")
                                                              .format("YYYY-MM-DD")
                                                      )
                                                    : formatDate(event.date) || "(chưa chọn)"}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        ))}
                    {filteredEvents.filter(
                        (event) =>
                            (event.type === "periodic" &&
                                !event.name.toLowerCase().includes("chào cờ") &&
                                !event.name.toLowerCase().includes("bảo quản") &&
                                !event.name.toLowerCase().includes("ngày nhà giáo") &&
                                !event.recurring_pattern) ||
                            event.type === "special"
                    ).length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                Không có sự kiện đặc biệt nào từ cơ sở dữ liệu
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, borderLeft: "4px solid #f44336" }}>
                <Typography variant="h6" gutterBottom color="error.main">
                    Ngày nghỉ lễ
                </Typography>
                <Grid container spacing={2}>
                    {filteredEvents
                        .filter((event) => event.type === "holiday")
                        .map((event) => (
                            <Grid item xs={12} md={6} key={event._id}>
                                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={event.selected !== false}
                                                onChange={(e) => {
                                                    setEventsData(
                                                        eventsData.map((e) =>
                                                            e._id === event._id
                                                                ? {
                                                                      ...e,
                                                                      selected: e.selected === false ? true : false,
                                                                  }
                                                                : e
                                                        )
                                                    );
                                                }}
                                                color="error"
                                            />
                                        }
                                        label={<Typography fontWeight="medium">{event.name}</Typography>}
                                    />
                                    <Grid container spacing={2} sx={{ mt: 1, pl: 4 }}>
                                        <Grid item xs={12}>
                                            <FormControl component="fieldset">
                                                <RadioGroup
                                                    row
                                                    name="timeConfigType"
                                                    value={event.timeConfigType || "single"}
                                                    onChange={(e) => {
                                                        setEventsData(
                                                            eventsData.map((ev) =>
                                                                ev._id === event._id
                                                                    ? {
                                                                          ...ev,
                                                                          timeConfigType: e.target.value,
                                                                      }
                                                                    : ev
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value="single"
                                                        control={<Radio size="small" />}
                                                        label="Ngày cụ thể"
                                                    />
                                                    <FormControlLabel
                                                        value="range"
                                                        control={<Radio size="small" />}
                                                        label="Khoảng thời gian"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>

                                        {(event.timeConfigType || "single") === "single" ? (
                                            <Grid item xs={12} md={6}>
                                                <DatePicker
                                                    label="Ngày nghỉ"
                                                    value={event.date ? dayjs(event.date) : null}
                                                    onChange={(newValue) => {
                                                        setEventsData(
                                                            eventsData.map((e) =>
                                                                e._id === event._id
                                                                    ? {
                                                                          ...e,
                                                                          date: newValue
                                                                              ? newValue.format("YYYY-MM-DD")
                                                                              : null,
                                                                          start_date: newValue
                                                                              ? newValue.format("YYYY-MM-DD")
                                                                              : null,
                                                                          end_date:
                                                                              newValue && event.duration_days > 1
                                                                                  ? newValue
                                                                                        .add(
                                                                                            event.duration_days - 1,
                                                                                            "day"
                                                                                        )
                                                                                        .format("YYYY-MM-DD")
                                                                                  : newValue
                                                                                  ? newValue.format("YYYY-MM-DD")
                                                                                  : null,
                                                                      }
                                                                    : e
                                                            )
                                                        );
                                                    }}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            helperText: "Chọn ngày nghỉ lễ",
                                                            required: true,
                                                            size: "small",
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                        ) : (
                                            <>
                                                <Grid item xs={12} md={6}>
                                                    <DatePicker
                                                        label="Ngày bắt đầu"
                                                        value={event.start_date ? dayjs(event.start_date) : null}
                                                        onChange={(newValue) => {
                                                            setEventsData(
                                                                eventsData.map((e) =>
                                                                    e._id === event._id
                                                                        ? {
                                                                              ...e,
                                                                              start_date: newValue
                                                                                  ? newValue.format("YYYY-MM-DD")
                                                                                  : null,
                                                                              date: newValue
                                                                                  ? newValue.format("YYYY-MM-DD")
                                                                                  : null,
                                                                          }
                                                                        : e
                                                                )
                                                            );
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                helperText: "Chọn ngày bắt đầu nghỉ",
                                                                required: true,
                                                                size: "small",
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <DatePicker
                                                        label="Ngày kết thúc"
                                                        value={event.end_date ? dayjs(event.end_date) : null}
                                                        onChange={(newValue) => {
                                                            const startDate = event.start_date
                                                                ? dayjs(event.start_date)
                                                                : null;
                                                            const endDate = newValue;
                                                            let durationDays = 1;

                                                            if (startDate && endDate) {
                                                                durationDays = endDate.diff(startDate, "day") + 1;
                                                                if (durationDays < 1) durationDays = 1;
                                                            }

                                                            setEventsData(
                                                                eventsData.map((e) =>
                                                                    e._id === event._id
                                                                        ? {
                                                                              ...e,
                                                                              end_date: newValue
                                                                                  ? newValue.format("YYYY-MM-DD")
                                                                                  : null,
                                                                              duration_days: durationDays,
                                                                          }
                                                                        : e
                                                                )
                                                            );
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                helperText: "Chọn ngày kết thúc nghỉ",
                                                                required: true,
                                                                size: "small",
                                                            },
                                                        }}
                                                        minDate={event.start_date ? dayjs(event.start_date) : undefined}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Số ngày"
                                                type="number"
                                                value={event.duration_days || 1}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 1;
                                                    setEventsData(
                                                        eventsData.map((ev) =>
                                                            ev._id === event._id
                                                                ? {
                                                                      ...ev,
                                                                      duration_days: value < 1 ? 1 : value,
                                                                  }
                                                                : ev
                                                        )
                                                    );
                                                }}
                                                fullWidth
                                                InputProps={{ inputProps: { min: 1 } }}
                                                size="small"
                                                disabled={(event.timeConfigType || "single") === "range"}
                                                helperText={
                                                    (event.timeConfigType || "single") === "range"
                                                        ? "Số ngày được tính tự động từ khoảng thời gian"
                                                        : ""
                                                }
                                            />
                                        </Grid>
                                    </Grid>{" "}
                                    {event.selected !== false && event.duration_days > 1 && (
                                        <Box mt={2} p={1} bgcolor="rgba(103, 58, 183, 0.1)" borderRadius={1}>
                                            <Typography variant="caption" display="block">
                                                <strong>Tóm tắt:</strong> Ngày nghỉ sẽ kéo dài {event.duration_days}{" "}
                                                ngày, từ{" "}
                                                {formatDate(event.date) ||
                                                    formatDate(event.start_date) ||
                                                    "(chưa chọn)"}{" "}
                                                đến{" "}
                                                {event.end_date
                                                    ? formatDate(event.end_date)
                                                    : event.date && event.duration_days > 1
                                                    ? formatDate(
                                                          dayjs(event.date)
                                                              .add(event.duration_days - 1, "day")
                                                              .format("YYYY-MM-DD")
                                                      )
                                                    : formatDate(event.date) || "(chưa chọn)"}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        ))}
                    {filteredEvents.filter((event) => event.type === "holiday").length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                Không có ngày nghỉ lễ nào từ cơ sở dữ liệu
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {/* <Paper elevation={1} sx={{ p: 3, borderLeft: "4px solid #9c27b0" }}>
                <Typography variant="h6" gutterBottom color="secondary.main">
                    Thêm sự kiện tùy chỉnh
                </Typography>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Tên sự kiện"
                            value={newEventName}
                            onChange={(e) => setNewEventName(e.target.value)}
                            fullWidth
                            InputProps={{
                                startAdornment: <EventIcon color="secondary" sx={{ mr: 1 }} />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <DatePicker
                            label="Ngày diễn ra"
                            value={newEventDate}
                            onChange={(newValue) => setNewEventDate(newValue)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Số ngày"
                            type="number"
                            value={newEventDuration}
                            onChange={(e) => setNewEventDuration(parseInt(e.target.value) || 1)}
                            fullWidth
                            InputProps={{ inputProps: { min: 1 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleAddCustomEvent}
                            disabled={!newEventName || !newEventDate}
                            sx={{ height: "56px", width: "100%" }}
                        >
                            Thêm
                        </Button>
                    </Grid>
                </Grid>

                {customEvents.length > 0 && (
                    <Box sx={{ mt: 3, border: "1px dashed #9c27b0", borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle2" color="secondary" gutterBottom>
                            Danh sách sự kiện đã thêm
                        </Typography>
                        <List dense>
                            {customEvents.map((event) => (
                                <ListItem
                                    key={event.id}
                                    secondaryAction={
                                        <Button
                                            onClick={() => handleRemoveCustomEvent(event.id)}
                                            color="error"
                                            size="small"
                                            variant="outlined"
                                            startIcon={<WarningIcon />}
                                        >
                                            Xóa
                                        </Button>
                                    }
                                    sx={{
                                        mb: 1,
                                        backgroundColor: "rgba(156, 39, 176, 0.08)",
                                        borderRadius: 1,
                                    }}
                                >
                                    <ListItemIcon>
                                        <EventIcon color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<Typography fontWeight="medium">{event.name}</Typography>}
                                        secondary={`Ngày: ${formatDate(event.date)} (${event.duration} ngày)`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Paper> */}
        </Box>
    );
};

export default Step2SpecialEvents;
