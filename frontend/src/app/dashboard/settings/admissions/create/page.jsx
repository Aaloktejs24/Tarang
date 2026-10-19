"use client";

import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, IconButton, Select, MenuItem, InputLabel, FormControl, Divider, Checkbox, FormControlLabel } from '@mui/material';
import { DeleteOutline, AddCircleOutline } from '@mui/icons-material';
import { apiClient } from '../../../../../lib/apiClient';
import { useProfile } from '../../../../../hooks/useProfile';
import { useRouter } from 'next/navigation';

export default function CreateAdmissionProgram() {
  const { profile } = useProfile();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    workflow_title: '',
    workflow_desc: '',
    image_url: '',
    last_date: '',
    seats: 0,
    academic_year: '',
    eligibility: '',
    fees: '',
    duration: '',
  });

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
          academicRecordsConfig: s.type === 'document' ? (s.academicRecordsConfig || []).filter(r => r.name?.trim() !== '') : [],
        }))
      };

      await apiClient.post('/admissions/programs', payload);
      alert("Admission program created successfully!");
      router.push(`/dashboard/explore/${profile?.username}/admission`);
    } catch (error) {
      console.error(error);
      alert("Failed to create admission program: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 4 }}>
        Create Admission Program
      </Typography>

      <form onSubmit={handleSubmit}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Program Details</Typography>
          <Grid container spacing={3}>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth label="Workflow Title" name="workflow_title" value={formData.workflow_title} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField fullWidth label="Academic Year" name="academic_year" placeholder="e.g. 2026-2030" value={formData.academic_year} onChange={handleChange} required />
            </Grid>
            <Grid size={{xs: 12}}>
              <TextField fullWidth multiline rows={3} label="Workflow Description" name="workflow_desc" value={formData.workflow_desc} onChange={handleChange} required />
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

        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
          Admission Stages
        </Typography>

        {stages.map((stage, sIndex) => (
          <Paper key={sIndex} elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: '16px', bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Stage {sIndex + 1}</Typography>
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
                <FormControl fullWidth>
                  <InputLabel>Stage Type</InputLabel>
                  <Select
                    value={stage.type}
                    label="Stage Type"
                    onChange={(e) => handleStageChange(sIndex, 'type', e.target.value)}
                  >
                    <MenuItem value="document">Document Request</MenuItem>
                    <MenuItem value="quiz">Entrance Quiz</MenuItem>
                    <MenuItem value="interview">Personal Interview</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {stage.type === 'document' && (
                <>
                  <Grid size={{xs: 12}}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#64748b' }}>Required Documents</Typography>
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
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#64748b' }}>Required Academic Records</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
                      Add specific academic records you require from the applicant and select which fields they must provide.
                    </Typography>
                    {(stage.academicRecordsConfig || []).map((req, rIndex) => (
                      <Box key={rIndex} sx={{ mb: 2, p: 2, border: '1px solid #e2e8f0', borderRadius: '8px', bgcolor: '#ffffff' }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                          <TextField size="small" fullWidth placeholder="Academic Record Name (e.g. 10th Marksheet)" value={req.name} onChange={(e) => handleAcademicRecordConfigChange(sIndex, rIndex, 'name', e.target.value)} />
                          <IconButton color="error" onClick={() => removeAcademicRecordConfig(sIndex, rIndex)}>
                            <DeleteOutline />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ pl: 1 }}>
                          <FormControlLabel
                            control={<Checkbox size="small" checked={true} sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#94a3b8' } }} />}
                            label={<Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155' }}>ACADEMIC RECORD</Typography>}
                            sx={{ pointerEvents: 'none' }}
                          />
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 4 }, pl: { xs: 1, sm: 4 }, mt: 0.5 }}>
                            <FormControlLabel
                              control={<Checkbox size="small" checked={req.qualification} onChange={(e) => handleAcademicRecordConfigChange(sIndex, rIndex, 'qualification', e.target.checked)} />}
                              label={<Typography variant="body2">Qualification <span style={{ color: '#64748b', fontSize: '0.7rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>+ proof</span></Typography>}
                            />
                            <FormControlLabel
                              control={<Checkbox size="small" checked={req.passingYear} onChange={(e) => handleAcademicRecordConfigChange(sIndex, rIndex, 'passingYear', e.target.checked)} />}
                              label={<Typography variant="body2">Passing Year</Typography>}
                            />
                            <FormControlLabel
                              control={<Checkbox size="small" checked={req.percentage} onChange={(e) => handleAcademicRecordConfigChange(sIndex, rIndex, 'percentage', e.target.checked)} />}
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

        <Button variant="outlined" startIcon={<AddCircleOutline />} onClick={addStage} sx={{ mb: 4, borderRadius: '8px' }}>
          Add Another Stage
        </Button>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={loading} sx={{ px: 6, py: 1.5, borderRadius: '8px', bgcolor: '#1e4fa3', '&:hover': { bgcolor: '#153a7a' } }}>
            {loading ? 'Publishing...' : 'Publish Admission Program'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
