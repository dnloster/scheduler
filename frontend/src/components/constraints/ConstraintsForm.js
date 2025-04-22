import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Chip,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  BusinessCenter as BusinessCenterIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';

const ConstraintsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Constraint data state
  const [constraint, setConstraint] = useState({
    name: '',
    type: '',
    description: '',
    applyTo: '',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    weekdays: [], // For day-of-week preferences
    timeSlots: [], // For time slot preferences
    specificFields: {} // For type-specific fields
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Sample data for dropdowns
  const constraintTypes = [
    { value: 'DateUnavailable', label: 'Ngày không khả dụng' },
    { value: 'TeacherUnavailable', label: 'Giảng viên không khả dụng' },
    { value: 'RoomUnavailable', label: 'Phòng không khả dụng' },
    { value: 'ClassPreference', label: 'Ưu tiên lớp học' },
    { value: 'TeacherPreference', label: 'Ưu tiên giảng viên' },
    { value: 'SubjectRequirement', label: 'Yêu cầu môn học' }
  ];
  
  const priorityLevels = [
    { value: 'High', label: 'Cao' },
    { value: 'Medium', label: 'Trung bình' },
    { value: 'Low', label: 'Thấp' }
  ];
  
  const weekdayOptions = [
    { value: 'monday', label: 'Thứ 2' },
    { value: 'tuesday', label: 'Thứ 3' },
    { value: 'wednesday', label: 'Thứ 4' },
    { value: 'thursday', label: 'Thứ 5' },
    { value: 'friday', label: 'Thứ 6' },
    { value: 'saturday', label: 'Thứ 7' },
    { value: 'sunday', label: 'Chủ nhật' }
  ];
  
  const timeSlotOptions = [
    { value: 'morning', label: 'Buổi sáng (7:00 - 11:30)' },
    { value: 'afternoon', label: 'Buổi chiều (13:00 - 17:30)' },
    { value: 'evening', label: 'Buổi tối (18:00 - 21:00)' }
  ];
  
  // Sample data for entity selection based on constraint type
  const [entityOptions, setEntityOptions] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      // In a real app, you would make an API call to fetch the constraint data
      // For now, we'll use sample data
      
      setTimeout(() => {
        if (id === '1') {
          // Sample data for a date constraint
          setConstraint({
            id: 1,
            name: 'Ngày nghỉ lễ - Quốc khánh',
            type: 'DateUnavailable',
            description: 'Ngày nghỉ lễ Quốc khánh 2/9',
            applyTo: 'Toàn trường',
            startDate: '2025-09-02',
            endDate: '2025-09-02',
            priority: 'High',
            weekdays: [],
            timeSlots: [],
            specificFields: {}
          });
          setEntityOptions(['Toàn trường', 'Sơ cấp báo vụ', 'Trung cấp hành chính', 'Cao cấp quản lý']);
        } else if (id === '2') {
          // Sample data for a teacher constraint
          setConstraint({
            id: 2,
            name: 'Giảng viên Nguyễn Văn A - Lịch bận',
            type: 'TeacherUnavailable',
            description: 'Giảng viên đi công tác nước ngoài',
            applyTo: 'Nguyễn Văn A',
            startDate: '2025-07-10',
            endDate: '2025-07-20',
            priority: 'High',
            weekdays: [],
            timeSlots: [],
            specificFields: {}
          });
          setEntityOptions(['Nguyễn Văn A', 'Trần Thị B', 'Lê Minh C', 'Phạm Văn D']);
        } else if (id === '4') {
          // Sample data for a preference constraint with weekdays
          setConstraint({
            id: 4,
            name: 'Hạn chế lớp Báo vụ A buổi tối',
            type: 'ClassPreference',
            description: 'Học viên lớp Báo vụ A có nhu cầu không học buổi tối',
            applyTo: 'Lớp Báo vụ A',
            startDate: '2025-06-01',
            endDate: '2025-12-31',
            priority: 'Low',
            weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            timeSlots: ['morning', 'afternoon'],
            specificFields: { preferredLocation: 'Khu A' }
          });
          setEntityOptions(['Lớp Báo vụ A', 'Lớp Báo vụ B', 'Lớp Báo vụ C', 'Lớp Hành chính A']);
        } else {
          // Default empty form for unknown ID
          setError('Không tìm thấy ràng buộc với ID này.');
        }
        
        setLoading(false);
      }, 500);
    }
  }, [id, isEditMode]);

  // Update entity options when constraint type changes
  useEffect(() => {
    if (constraint.type) {
      switch (constraint.type) {
        case 'TeacherUnavailable':
        case 'TeacherPreference':
          setEntityOptions(['Nguyễn Văn A', 'Trần Thị B', 'Lê Minh C', 'Phạm Văn D']);
          break;
        case 'RoomUnavailable':
          setEntityOptions(['Phòng A101', 'Phòng A102', 'Phòng B201', 'Phòng B202', 'Hội trường A']);
          break;
        case 'ClassPreference':
          setEntityOptions(['Lớp Báo vụ A', 'Lớp Báo vụ B', 'Lớp Báo vụ C', 'Lớp Hành chính A']);
          break;
        case 'DateUnavailable':
          setEntityOptions(['Toàn trường', 'Sơ cấp báo vụ', 'Trung cấp hành chính', 'Cao cấp quản lý']);
          break;
        case 'SubjectRequirement':
          setEntityOptions(['Nghiệp vụ cơ bản', 'Kỹ năng báo cáo', 'Quản lý thời gian', 'Soạn thảo văn bản']);
          break;
        default:
          setEntityOptions([]);
      }
    }
  }, [constraint.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConstraint(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleWeekdaysChange = (event, newValue) => {
    setConstraint(prev => ({
      ...prev,
      weekdays: newValue
    }));
  };

  const handleTimeSlotsChange = (event, newValue) => {
    setConstraint(prev => ({
      ...prev,
      timeSlots: newValue
    }));
  };

  const handleSpecificFieldChange = (name, value) => {
    setConstraint(prev => ({
      ...prev,
      specificFields: {
        ...prev.specificFields,
        [name]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!constraint.name) {
      newErrors.name = 'Vui lòng nhập tên ràng buộc';
    }
    
    if (!constraint.type) {
      newErrors.type = 'Vui lòng chọn loại ràng buộc';
    }
    
    if (!constraint.applyTo) {
      newErrors.applyTo = 'Vui lòng chọn đối tượng áp dụng';
    }
    
    if (!constraint.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    
    if (!constraint.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    } else if (constraint.startDate && constraint.endDate && new Date(constraint.startDate) > new Date(constraint.endDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    if (!constraint.priority) {
      newErrors.priority = 'Vui lòng chọn mức ưu tiên';
    }
    
    // Type-specific validations
    if (constraint.type === 'TeacherPreference' || constraint.type === 'ClassPreference') {
      if (constraint.weekdays.length === 0) {
        newErrors.weekdays = 'Vui lòng chọn ít nhất một ngày trong tuần';
      }
      if (constraint.timeSlots.length === 0) {
        newErrors.timeSlots = 'Vui lòng chọn ít nhất một khung giờ';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    // In a real app, you would make an API call to save the constraint data
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      
      // Auto navigate back after success
      setTimeout(() => {
        navigate('/constraints');
      }, 1500);
    }, 1000);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ràng buộc này?')) {
      // In a real app, you would make an API call to delete the constraint
      navigate('/constraints');
    }
  };

  // Get constraint type icon for display
  const getConstraintTypeIcon = (type) => {
    switch (type) {
      case 'DateUnavailable':
        return <EventBusyIcon color="error" />;
      case 'TeacherUnavailable':
      case 'RoomUnavailable':
        return <BlockIcon color="error" />;
      case 'ClassPreference':
      case 'TeacherPreference':
        return <EventAvailableIcon color="success" />;
      case 'SubjectRequirement':
        return <BusinessCenterIcon color="info" />;
      default:
        return null;
    }
  };

  // Render additional fields based on constraint type
  const renderTypeSpecificFields = () => {
    switch (constraint.type) {
      case 'TeacherPreference':
      case 'ClassPreference':
        return (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Tùy chọn thời gian" />
              </Divider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                id="weekdays"
                options={weekdayOptions}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                value={weekdayOptions.filter(day => constraint.weekdays.includes(day.value))}
                onChange={handleWeekdaysChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ngày trong tuần"
                    placeholder="Chọn ngày"
                    error={!!errors.weekdays}
                    helperText={errors.weekdays}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.label}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))
                }
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                id="timeSlots"
                options={timeSlotOptions}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                value={timeSlotOptions.filter(slot => constraint.timeSlots.includes(slot.value))}
                onChange={handleTimeSlotsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Khung giờ"
                    placeholder="Chọn khung giờ"
                    error={!!errors.timeSlots}
                    helperText={errors.timeSlots}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.label}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))
                }
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Grid>
            
            {constraint.type === 'ClassPreference' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Địa điểm ưu tiên"
                  value={constraint.specificFields.preferredLocation || ''}
                  onChange={(e) => handleSpecificFieldChange('preferredLocation', e.target.value)}
                />
              </Grid>
            )}
          </>
        );
      
      case 'SubjectRequirement':
        return (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Yêu cầu môn học" />
              </Divider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số giờ tối thiểu"
                type="number"
                value={constraint.specificFields.minHours || ''}
                onChange={(e) => handleSpecificFieldChange('minHours', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại phòng học cần thiết</InputLabel>
                <Select
                  value={constraint.specificFields.requiredRoomType || ''}
                  onChange={(e) => handleSpecificFieldChange('requiredRoomType', e.target.value)}
                  label="Loại phòng học cần thiết"
                >
                  <MenuItem value="standard">Phòng học thường</MenuItem>
                  <MenuItem value="lab">Phòng thực hành</MenuItem>
                  <MenuItem value="conference">Phòng hội thảo</MenuItem>
                  <MenuItem value="computer">Phòng máy tính</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            {constraint.type && getConstraintTypeIcon(constraint.type)}
            <Typography variant="h4" sx={{ ml: 1 }}>
              {isEditMode ? 'Chỉnh sửa ràng buộc' : 'Thêm ràng buộc mới'}
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/constraints')}
              sx={{ mr: 1 }}
            >
              Quay lại
            </Button>
            {isEditMode && (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                sx={{ mr: 1 }}
              >
                Xóa
              </Button>
            )}
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Ràng buộc đã được lưu thành công!
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Tên ràng buộc"
              value={constraint.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.type}>
              <InputLabel id="type-label">Loại ràng buộc</InputLabel>
              <Select
                labelId="type-label"
                name="type"
                value={constraint.type}
                onChange={handleChange}
                label="Loại ràng buộc"
              >
                {constraintTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.priority}>
              <InputLabel id="priority-label">Mức ưu tiên</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={constraint.priority}
                onChange={handleChange}
                label="Mức ưu tiên"
              >
                {priorityLevels.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.priority && <FormHelperText>{errors.priority}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Mô tả"
              value={constraint.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          
          {constraint.type && (
            <Grid item xs={12} md={12}>
              <FormControl fullWidth required error={!!errors.applyTo}>
                <InputLabel id="applyTo-label">Áp dụng cho</InputLabel>
                <Select
                  labelId="applyTo-label"
                  name="applyTo"
                  value={constraint.applyTo}
                  onChange={handleChange}
                  label="Áp dụng cho"
                >
                  {entityOptions.map((entity) => (
                    <MenuItem key={entity} value={entity}>
                      {entity}
                    </MenuItem>
                  ))}
                </Select>
                {errors.applyTo && <FormHelperText>{errors.applyTo}</FormHelperText>}
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} md={6}>
            <TextField
              name="startDate"
              label="Ngày bắt đầu"
              type="date"
              value={constraint.startDate}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.startDate}
              helperText={errors.startDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="endDate"
              label="Ngày kết thúc"
              type="date"
              value={constraint.endDate}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.endDate}
              helperText={errors.endDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          {/* Render additional fields based on constraint type */}
          {renderTypeSpecificFields()}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ConstraintsForm;