"use client";
import { useAppRouter as useRouter } from '../../../../../hooks/useAppRouter';
import React, { useState } from 'react';
import { Box, Typography, TextField, Grid, Paper, IconButton, Divider, CircularProgress, Button } from '@mui/material';
import CentralDropdown from '../../../../../components/common/SelectDropdown';
import CustomCheckbox from '../../../../../components/common/Checkbox';
import { DeleteOutline, AddCircleOutline } from '@mui/icons-material';
import { apiClient } from '../../../../../lib/apiClient';
import { useProfile } from '../../../../../hooks/useProfile';
import { useToast } from '../../../../../contexts/ToastContext';
import TarangButton from '../../../../../components/common/TarangButton';

export default function CreateAdmissionProgram() {
  const { profile } = useProfile();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    form_title: '',
    form_desc: '',
    image_url: '',
    last_date: '',
    seats: 0,
    academic_year: '',
    eligibility: '',
    fees: '',
    duration: '' });

  const [stages, setStages] = useState([
    { title: '', type: 'document', requirements: [''], academicRecordsConfig: [] }
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStageChange = (index, field, value) => {
    const newStages = [...stages];
    newStages[index][field] = value;
    setStages(newStages);
  };

  const handleRequirementChange = (stageIndex, reqIndex, value) => {
    const newStages = [...stages];
    newStages[stageIndex].requirements[reqIndex] = value;
    setStages(newStages);
  };

  const addRequirement = (stageIndex) => {
    const newStages = [...stages];
    newStages[stageIndex].requirements.push('');
    setStages(newStages);
  };

  const removeRequirement = (stageIndex, reqIndex) => {
    const newStages = [...stages];
    newStages[stageIndex].requirements.splice(reqIndex, 1);
    setStages(newStages);
  };

  const addAcademicRecordConfig = (stageIndex) => {
    const newStages = [...stages];
    if (!newStages[stageIndex].academicRecordsConfig) newStages[stageIndex].academicRecordsConfig = [];
    newStages[stageIndex].academicRecordsConfig.push({
      name: '',
      qualification: false,
      passingYear: false,
      percentage: false
    });
    setStages(newStages);
  };

  const handleAcademicRecordConfigChange = (stageIndex, reqIndex, field, value) => {
    const newStages = [...stages];
    newStages[stageIndex].academicRecordsConfig[reqIndex][field] = value;
    setStages(newStages);
  };

  const removeAcademicRecordConfig = (stageIndex, reqIndex) => {
    const newStages = [...stages];
    newStages[stageIndex].academicRecordsConfig.splice(reqIndex, 1);
    setStages(newStages);
  };

  const addStage = () => {
    setStages([...stages, { title: '', type: 'document', requirements: [''], academicRecordsConfig: [] }]);
  };

  const removeStage = (index) => {
    const newStages = [...stages];
    newStages.splice(index, 1);
    setStages(newStages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        institute_id: profile?.username, // Ensure your user context has the ID
        ...formData,
        seats: parseInt(formData.seats, 10),
        stages: stages.map(s => ({
          title: s.title,
          type: s.type,
          requirements: s.type === 'document' ? s.requirements.filter(r => r.trim() !== '') : [],
          academicRecordsConfig: s.type === 'document' ? (s.academicRecordsConfig || []).filter(r => r.name?.trim() !== '') : [] }))
      };

      await apiClient.post('/admissions/programs', payload);
      showToast("Admission program created successfully!", "success");
      router.push(`/dashboard/explore/${profile?.username}/admission`);
    } catch (error) {
      console.error(error);
      showToast("Failed to create admission program: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 4 }}>
        Create Admission Program
      </Typography>

      <form onSubmit={handleSubmit}>
        <Paper elevation={0} sx={{ p: 4, mb: 4,  borderRadius: 'var(--radius-lg)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'var(--font-semibold)', mb: 3 }}>Program Details</Typography>
          <Grid container spacing={3}>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth label="Program Title" name="form_title" value={formData.form_title} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth label="Academic Year" name="academic_year" placeholder="e.g. 2026-2030" value={formData.academic_year} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12}}>
              <TextField fullWidth multiline rows={3} label="Program Description" name="form_desc" value={formData.form_desc} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth label="Last Date to Apply" name="last_date" placeholder="e.g. 15 August 2026" value={formData.last_date} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth type="number" label="Number of Seats" name="seats" value={formData.seats} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth label="Eligibility Criteria" name="eligibility" placeholder="e.g. 75% in 12th PCM" value={formData.eligibility} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth label="Fees" name="fees" placeholder="e.g. ₹1.5L / Semester" value={formData.fees} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth label="Duration" name="duration" placeholder="e.g. 4 Years" value={formData.duration} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth label="Cover Image URL" name="image_url" placeholder="https://..." value={formData.image_url} onChange={handleChange} />
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h5" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 3 }}>
          Admission Stages
        </Typography>

        {stages.map((stage, sIndex) => (
          <Paper key={sIndex} elevation={0} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-semibold)' }}>Stage {sIndex + 1}</Typography>
              {stages.length > 1 && (
                <IconButton color="error" onClick={() => removeStage(sIndex)}>
                  <DeleteOutline />
                </IconButton>
              )}
            </Box>
            
            <Grid container spacing={2}>
              <Grid size={{xs: 12, sm: 8}}>
                <TextField fullWidth label="Stage Title" value={stage.title} onChange={(e) => handleStageChange(sIndex, 'title', e.target.value)} required />
              </Grid>
              <Grid size={{xs: 12, sm: 4}}>
                <CentralDropdown
                  label="Stage Type"
                  value={stage.type}
                  onChange={(e) => handleStageChange(sIndex, 'type', e.target.value)}
                  options={[
                    { value: "document", label: "Document Request" },
                    { value: "quiz", label: "Entrance Quiz" },
                    { value: "interview", label: "Personal Interview" }
                  ]}
                  searchable={false}
                />
              </Grid>

              {stage.type === 'document' && (
                <>
                  <Grid size={{xs: 12}}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-medium)', color: 'var(--color-slate-500)' }}>Required Documents</Typography>
                    {(stage.requirements || []).map((req, rIndex) => (
                      <Box key={rIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField size="small" fullWidth placeholder="e.g. Identity Proof" value={req} onChange={(e) => handleRequirementChange(sIndex, rIndex, e.target.value)} />
                        <IconButton color="error" onClick={() => removeRequirement(sIndex, rIndex)}>
                          <DeleteOutline />
                        </IconButton>
                      </Box>
                    ))}
                    <Button startIcon={<AddCircleOutline />} size="small" onClick={() => addRequirement(sIndex)}>
                      Add Document
                    </Button>
                  </Grid>

                  <Grid size={{xs: 12}}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-medium)', color: 'var(--color-slate-500)' }}>Required Academic Records</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', display: 'block', mb: 2 }}>
                      Add specific academic records you require from the applicant and select which fields they must provide.
                    </Typography>
                    {(stage.academicRecordsConfig || []).map((req, rIndex) => (
                      <Box key={rIndex} sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                          <TextField size="small" fullWidth placeholder="Academic Record Name (e.g. 10th Marksheet)" value={req.name} onChange={(e) => handleAcademicRecordConfigChange(sIndex, rIndex, 'name', e.target.value)} />
                          <IconButton color="error" onClick={() => removeAcademicRecordConfig(sIndex, rIndex)}>
                            <DeleteOutline />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ pl: 1 }}>
                          <CustomCheckbox
                            checked={true}
                            sx={{ pointerEvents: 'none', mb: 0.5 }}
                            label={<Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)' }}>ACADEMIC RECORD</Typography>}
                          />
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 4 }, pl: { xs: 1, sm: 4 } }}>
                            <CustomCheckbox
                              checked={req.qualification}
                              onChange={(e) => handleAcademicRecordConfigChange(sIndex, rIndex, 'qualification', e.target.checked)}
                              label={<Typography variant="body2">Qualification <span style={{ color: 'var(--color-slate-500)', fontSize: '0.7rem', backgroundColor: 'var(--color-slate-50)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', marginLeft: '4px' }}>+ proof</span></Typography>}
                            />
                            <CustomCheckbox
                              checked={req.passingYear}
                              onChange={(e) => handleAcademicRecordConfigChange(sIndex, rIndex, 'passingYear', e.target.checked)}
                              label={<Typography variant="body2">Passing Year</Typography>}
                            />
                            <CustomCheckbox
                              checked={req.percentage}
                              onChange={(e) => handleAcademicRecordConfigChange(sIndex, rIndex, 'percentage', e.target.checked)}
                              label={<Typography variant="body2">Percentage / CGPA</Typography>}
                            />
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    <Button startIcon={<AddCircleOutline />} size="small" onClick={() => addAcademicRecordConfig(sIndex)}>
                      Add Academic Record
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        ))}

        <TarangButton variant="outlined" startIcon={<AddCircleOutline />} onClick={addStage} sx={{ mb: 4 }}>
          Add Another Stage
        </TarangButton>

        <Box sx={{ mt: 4, pt: 3, borderTop: 'var(--border-thin) solid var(--color-slate-200)', display: 'flex', justifyContent: 'flex-end' }}>
          <TarangButton type="submit" loading={loading} disabled={loading} sx={{ px: 6 }}>
            Publish Admission Program
          </TarangButton>
        </Box>
      </form>
    </Box>
  );
}
