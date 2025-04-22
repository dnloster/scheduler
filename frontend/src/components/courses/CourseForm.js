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
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Book as BookIcon
} from '@mui/icons-material';
import axios from 'axios';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Department data for dropdown
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Sơ cấp báo vụ' }
  ]);
  
  // Parent courses for dropdown (only main courses)
  const [mainCourses, setMainCourses] = useState([
    { id: 1, code: 'A10', name: 'Môn A10' },
    { id: 2, code: 'Q10', name: 'Môn Q10' },
    { id: 3, code: 'V30', name: 'Môn V30' }
  ]);
  
  // Course data state
  const [course, setCourse] = useState({
    code: '',
    name: '',
    departmentId: 1,
    description: '',
    total_hours: 0,
    theory_hours: 0,
    practical_hours: 0,
    is_subcourse: false,
    parent_course_id: null
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      // In a real app, you would make an API call to fetch the course data
      // For now, we'll use sample data
      
      setTimeout(() => {
        if (id === '1') {
          // Sample data for a main course
          setCourse({
            id: 1, 
            code: 'A10', 
            name: 'Môn A10', 
            departmentId: 1,
            parent_course_id: null,
            total_hours: 160, 
            theory_hours: 160, 
            practical_hours: 0,
            description: 'Môn học A10 được dạy theo lớp ghép A-B, C-D, E-F.',
            is_subcourse: false
          });
        } else if (id === '8') {
          // Sample data for a subcourse
          setCourse({
            id: 8, 
            code: 'Q11', 
            name: 'Môn Q11', 
            departmentId: 1,
            parent_course_id: 2,
            total_hours: 12, 
            theory_hours: 0, 
            practical_hours: 12,
            description: 'Môn Q11 là môn con của Q10, chỉ bao gồm thực hành.',
            is_subcourse: true
          });
        }
        setLoading(false);
      }, 500);
    }
  }, [id, isEditMode]);

  // Update total hours when theory or practical hours change
  useEffect(() => {
    setCourse(prev => ({
      ...prev,
      total_hours: Number(prev.theory_hours) + Number(prev.practical_hours)
    }));
  }, [course.theory_hours, course.practical_hours]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!course.code.trim()) {
      newErrors.code = 'Mã môn học là bắt buộc';
    }
    
    if (!course.name.trim()) {
      newErrors.name = 'Tên môn học là bắt buộc';
    }
    
    if (course.is_subcourse && !course.parent_course_id) {
      newErrors.parent_course_id = 'Vui lòng chọn môn học chính';
    }
    
    if (Number(course.theory_hours) < 0) {
      newErrors.theory_hours = 'Số tiết lý thuyết không được âm';
    }
    
    if (Number(course.practical_hours) < 0) {
      newErrors.practical_hours = 'Số tiết thực hành không được âm';
    }
    
    if (Number(course.theory_hours) + Number(course.practical_hours) <= 0) {
      newErrors.total_hours = 'Tổng số tiết phải lớn hơn 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourse({
      ...course,
      [name]: value
    });
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setCourse({
      ...course,
      [name]: value === '' ? 0 : Number(value)
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    
    // Reset parent course if switching from subcourse to main course
    if (name === 'is_subcourse' && !checked) {
      setCourse({
        ...course,
        is_subcourse: checked,
        parent_course_id: null
      });
    } else {
      setCourse({
        ...course,
        [name]: checked
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại thông tin nhập.');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    // In a real app, you would make an API call to save the course
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      
      // Redirect to course list after saving
      setTimeout(() => {
        navigate('/courses');
      }, 1500);
    }, 1000);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      // In a real app, you would make an API call to delete the course
      navigate('/courses');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            {isEditMode ? `Chỉnh sửa môn học: ${course.name}` : 'Thêm môn học mới'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/courses')}
          >
            Quay lại
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Lưu thành công!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={course.is_subcourse}
                    onChange={handleSwitchChange}
                    name="is_subcourse"
                    color="primary"
                  />
                }
                label="Đây là môn học con (thuộc một môn học chính)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="department-label">Chuyên ngành</InputLabel>
                <Select
                  labelId="department-label"
                  value={course.departmentId}
                  name="departmentId"
                  label="Chuyên ngành"
                  onChange={handleInputChange}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {course.is_subcourse && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.parent_course_id}>
                  <InputLabel id="parent-course-label">Môn học chính</InputLabel>
                  <Select
                    labelId="parent-course-label"
                    value={course.parent_course_id || ''}
                    name="parent_course_id"
                    label="Môn học chính"
                    onChange={handleInputChange}
                  >
                    {mainCourses.map(mainCourse => (
                      <MenuItem key={mainCourse.id} value={mainCourse.id}>
                        {mainCourse.code} - {mainCourse.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.parent_course_id && (
                    <FormHelperText>{errors.parent_course_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã môn học"
                name="code"
                value={course.code}
                onChange={handleInputChange}
                error={!!errors.code}
                helperText={errors.code}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên môn học"
                name="name"
                value={course.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={course.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Phân bổ tiết học
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Số tiết lý thuyết"
                name="theory_hours"
                type="number"
                value={course.theory_hours}
                onChange={handleNumberInputChange}
                error={!!errors.theory_hours}
                helperText={errors.theory_hours}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Số tiết thực hành"
                name="practical_hours"
                type="number"
                value={course.practical_hours}
                onChange={handleNumberInputChange}
                error={!!errors.practical_hours}
                helperText={errors.practical_hours}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tổng số tiết"
                value={course.total_hours}
                disabled
                error={!!errors.total_hours}
                helperText={errors.total_hours}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between">
                {isEditMode ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                  >
                    Xóa môn học
                  </Button>
                ) : (
                  <Box /> // Empty box to maintain layout
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu môn học'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CourseForm;