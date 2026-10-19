"use client";

import localeData from '../../data/localeData.json';
const { languageFonts: languageFonts } = localeData;

import React, { useState } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, Fab, Popover, CircularProgress, TextField, ListSubheader, InputAdornment } from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SettingsAccessibilityIcon from '@mui/icons-material/SettingsAccessibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useTranslation } from '../../hooks/useTranslation';

export default function AccessibilityMenu() {
  const { fontFamily, setFontFamily, language, setLanguage, autoDetectLanguage, isDetecting } = useAccessibility();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFontChange = (e) => {
    setFontFamily(e.target.value);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'accessibility-popover' : undefined;

  return (
    <>
      <Fab
        color="primary"
        aria-label="accessibility"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, md: 40 },
          left: { xs: 24, md: 40 },
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          zIndex: 10001,
          bgcolor: '#0056b3 !important',
          boxShadow: 'none',
          border: '1.5px solid #ffc107',
          '&:hover, &:focus': {
            bgcolor: '#004494 !important',
          }
        }}
      >
        <SettingsAccessibilityIcon />
      </Fab>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        sx={{ zIndex: 10002 }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: -2,
            ml: 2,
            p: { xs: 3, sm: 4 },
            background: `
              radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.25) 0, transparent 50%), 
              radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.2) 0, transparent 50%), 
              radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.15) 0, transparent 50%),
              radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
              #ffffff
            `,
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            minWidth: 320,
            maxWidth: 380,
            width: '100%'
          }
        }}
      >

        {/* FONT SELECTOR */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 800, color: '#1e293b', mb: 1, fontSize: '0.95rem', fontFamily: "'Inter', sans-serif" }}>
            {t('accessibilityMenu.fontStyle')}
          </Typography>
          <FormControl fullWidth>
            <Select
              value={fontFamily}
              onChange={handleFontChange}
              sx={{
                color: '#111827',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                fontWeight: 500,
                backgroundColor: '#f8fafc',
                borderRadius: "8px",
                transition: 'all 0.2s ease',
                '& .MuiSelect-select': {
                  padding: '12px 14px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0',
                  borderWidth: '1px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#cbd5e1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1e293b',
                  borderWidth: '1px',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                }
              }}
              MenuProps={{
                sx: { zIndex: 11000 },
                PaperProps: {
                  sx: { maxHeight: 320 }
                }
              }}
            >
              {(languageFonts[language] || languageFonts['en']).map((font, idx) => (
                <MenuItem 
                  key={idx} 
                  value={font.value} 
                  sx={{ fontFamily: `${font.value} !important` }}
                >
                  {font.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* LANGUAGE TOGGLE */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 700, 
              color: '#334155',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Choose Language
            </Typography>
            <Button 
              size="small" 
              variant="text" 
              onClick={autoDetectLanguage}
              disabled={isDetecting}
              startIcon={isDetecting ? <CircularProgress size={14} /> : <LocationOnIcon fontSize="small" />}
              sx={{ 
                fontSize: '12px', 
                textTransform: 'none', 
                fontWeight: 600,
                color: '#0056b3',
                minWidth: 'auto',
                p: '4px 8px'
              }}
            >
              {isDetecting ? 'Detecting...' : 'Auto-Detect'}
            </Button>
          </Box>
          <FormControl fullWidth variant="outlined">
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              sx={{
                color: '#111827',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                fontWeight: 500,
                backgroundColor: '#ffffff',
                borderRadius: "8px",
                transition: 'all 0.2s ease',
                '& .MuiSelect-select': {
                  padding: '12px 14px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0',
                  borderWidth: '1px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#cbd5e1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1e293b',
                  borderWidth: '1px',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                }
              }}
              MenuProps={{
                sx: { zIndex: 11000 },
                PaperProps: {
                  sx: { maxHeight: 320 }
                },
                MenuListProps: {
                  sx: { p: 0 }
                }
              }}
            >
              <ListSubheader sx={{ p: 1.5, borderBottom: "1px solid #e2e8f0", backgroundColor: '#fff', zIndex: 2, lineHeight: 'normal', m: 0 }}>
                <TextField
                  size="medium"
                  autoFocus
                  placeholder="Search language..."
                  fullWidth
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        transition: "all 0.2s ease-in-out",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#cbd5e1" },
                        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                    },
                    "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
                  }}
                />
              </ListSubheader>
              {(!searchQuery || "en".includes(searchQuery.toLowerCase())) && <MenuItem value="en">English (Latin)<span style={{ display: "none" }}>English</span></MenuItem>}
              {(!searchQuery || "hi".includes(searchQuery.toLowerCase())) && <MenuItem value="hi">हिन्दी (देवनागरी)<span style={{ display: "none" }}>Hindi</span></MenuItem>}
              {(!searchQuery || "bn".includes(searchQuery.toLowerCase())) && <MenuItem value="bn">বাংলা (বাংলা)<span style={{ display: "none" }}>Bangla</span></MenuItem>}
              {(!searchQuery || "te".includes(searchQuery.toLowerCase())) && <MenuItem value="te">తెలుగు (తెలుగు)<span style={{ display: "none" }}>Telugu</span></MenuItem>}
              {(!searchQuery || "mr".includes(searchQuery.toLowerCase())) && <MenuItem value="mr">मराठी (देवनागरी)<span style={{ display: "none" }}>Marathi</span></MenuItem>}
              {(!searchQuery || "ta".includes(searchQuery.toLowerCase())) && <MenuItem value="ta">தமிழ் (தமிழ்)<span style={{ display: "none" }}>Tamil</span></MenuItem>}
              {(!searchQuery || "ur".includes(searchQuery.toLowerCase())) && <MenuItem value="ur">اردو &lrm;(نستعلیق)<span style={{ display: "none" }}>Urdu</span></MenuItem>}
              {(!searchQuery || "gu".includes(searchQuery.toLowerCase())) && <MenuItem value="gu">ગુજરાતી (ગુજરાતી)<span style={{ display: "none" }}>Gujarati</span></MenuItem>}
              {(!searchQuery || "kn".includes(searchQuery.toLowerCase())) && <MenuItem value="kn">ಕನ್ನಡ (ಕನ್ನಡ)<span style={{ display: "none" }}>Kannada</span></MenuItem>}
              {(!searchQuery || "or".includes(searchQuery.toLowerCase())) && <MenuItem value="or">ଓଡ଼ିଆ (ଓଡ଼ିଆ)<span style={{ display: "none" }}>Odia</span></MenuItem>}
              {(!searchQuery || "ml".includes(searchQuery.toLowerCase())) && <MenuItem value="ml">മലയാളം (മലയാളം)<span style={{ display: "none" }}>Malayalam</span></MenuItem>}
              {(!searchQuery || "pa".includes(searchQuery.toLowerCase())) && <MenuItem value="pa">ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ)<span style={{ display: "none" }}>Punjabi</span></MenuItem>}
              {(!searchQuery || "as".includes(searchQuery.toLowerCase())) && <MenuItem value="as">অসমীয়া (অসমীয়া)<span style={{ display: "none" }}>Assamese</span></MenuItem>}
              {(!searchQuery || "mai".includes(searchQuery.toLowerCase())) && <MenuItem value="mai">मैथिली (देवनागरी)<span style={{ display: "none" }}>Maithili</span></MenuItem>}
              {(!searchQuery || "sat".includes(searchQuery.toLowerCase())) && <MenuItem value="sat">ᱥᱟᱱᱛᱟᱲᱤ (ᱚᱞ ᱪᱤᱠᱤ)<span style={{ display: "none" }}>Santali</span></MenuItem>}
              {(!searchQuery || "ks".includes(searchQuery.toLowerCase())) && <MenuItem value="ks">کٲشُر &lrm;(نستعلیق)<span style={{ display: "none" }}>Kashmiri</span></MenuItem>}
              {(!searchQuery || "ne".includes(searchQuery.toLowerCase())) && <MenuItem value="ne">नेपाली (देवनागरी)<span style={{ display: "none" }}>Nepali</span></MenuItem>}
              {(!searchQuery || "kok".includes(searchQuery.toLowerCase())) && <MenuItem value="kok">कोंकणी (देवनागरी)<span style={{ display: "none" }}>Konkani</span></MenuItem>}
              {(!searchQuery || "sd".includes(searchQuery.toLowerCase())) && <MenuItem value="sd">सिंधी (देवनागरी)<span style={{ display: "none" }}>Sindhi</span></MenuItem>}
              {(!searchQuery || "doi".includes(searchQuery.toLowerCase())) && <MenuItem value="doi">डोगरी (देवनागरी)<span style={{ display: "none" }}>Dogri</span></MenuItem>}
              {(!searchQuery || "mni".includes(searchQuery.toLowerCase())) && <MenuItem value="mni">ꯃꯤꯇꯩꯂꯣꯟ (ꯃꯤꯇꯩ ꯃꯌꯦꯛ)<span style={{ display: "none" }}>Meitei</span></MenuItem>}
              {(!searchQuery || "brx".includes(searchQuery.toLowerCase())) && <MenuItem value="brx">बोडो (देवनागरी)<span style={{ display: "none" }}>Bodo</span></MenuItem>}
              {(!searchQuery || "sa".includes(searchQuery.toLowerCase())) && <MenuItem value="sa">संस्कृतम् (देवनागरी)<span style={{ display: "none" }}>Sanskrit</span></MenuItem>}
              {(!searchQuery || "bho".includes(searchQuery.toLowerCase())) && <MenuItem value="bho">भोजपुरी (देवनागरी)<span style={{ display: "none" }}>Bhojpuri</span></MenuItem>}
              {(!searchQuery || "kha".includes(searchQuery.toLowerCase())) && <MenuItem value="kha">खड़ी बोली (देवनागरी)<span style={{ display: "none" }}>Khari Boli</span></MenuItem>}
              {(!searchQuery || "bra".includes(searchQuery.toLowerCase())) && <MenuItem value="bra">ब्रज (देवनागरी)<span style={{ display: "none" }}>Braj</span></MenuItem>}
              {(!searchQuery || "roh".includes(searchQuery.toLowerCase())) && <MenuItem value="roh">रोहिलखंडी (देवनागरी)<span style={{ display: "none" }}>Rohilkhandi</span></MenuItem>}
              {(!searchQuery || "kan".includes(searchQuery.toLowerCase())) && <MenuItem value="kan">कन्नौजी (देवनागरी)<span style={{ display: "none" }}>Kannauji</span></MenuItem>}
              {(!searchQuery || "awa".includes(searchQuery.toLowerCase())) && <MenuItem value="awa">अवधी (देवनागरी)<span style={{ display: "none" }}>Awadhi</span></MenuItem>}
              {(!searchQuery || "bun".includes(searchQuery.toLowerCase())) && <MenuItem value="bun">बुंदेली (देवनागरी)<span style={{ display: "none" }}>Bundeli</span></MenuItem>}
              {(!searchQuery || "bag".includes(searchQuery.toLowerCase())) && <MenuItem value="bag">बघेली (देवनागरी)<span style={{ display: "none" }}>Bagheli</span></MenuItem>}
              {(!searchQuery || "pah".includes(searchQuery.toLowerCase())) && <MenuItem value="pah">پہاڑی &lrm;(نستعلیق)<span style={{ display: "none" }}>Pahari</span></MenuItem>}
              {(!searchQuery || "bhd".includes(searchQuery.toLowerCase())) && <MenuItem value="bhd">भद्रवाही (देवनागरी)<span style={{ display: "none" }}>Bhaderwahi</span></MenuItem>}
              {(!searchQuery || "ksw".includes(searchQuery.toLowerCase())) && <MenuItem value="ksw">کشتواڑی &lrm;(نستعلیق)<span style={{ display: "none" }}>Kishtwari</span></MenuItem>}
              {(!searchQuery || "srz".includes(searchQuery.toLowerCase())) && <MenuItem value="srz">सराजी (देवनागरी)<span style={{ display: "none" }}>Sarazi</span></MenuItem>}
              {(!searchQuery || "phr".includes(searchQuery.toLowerCase())) && <MenuItem value="phr">پھاڑی پوٹھوہاری &lrm;(عربی)<span style={{ display: "none" }}>Pahari Pothohari</span></MenuItem>}
              {(!searchQuery || "scl".includes(searchQuery.toLowerCase())) && <MenuItem value="scl">شینا &lrm;(عربی)<span style={{ display: "none" }}>Shina</span></MenuItem>}
              {(!searchQuery || "bft".includes(searchQuery.toLowerCase())) && <MenuItem value="bft">بلتی &lrm;(عربی)<span style={{ display: "none" }}>Balti</span></MenuItem>}
              {(!searchQuery || "khw".includes(searchQuery.toLowerCase())) && <MenuItem value="khw">کھوار &lrm;(عربی)<span style={{ display: "none" }}>Khowar</span></MenuItem>}
              {(!searchQuery || "bsk".includes(searchQuery.toLowerCase())) && <MenuItem value="bsk">بروشسکی &lrm;(عربی)<span style={{ display: "none" }}>Burushaski</span></MenuItem>}
              {(!searchQuery || "lad".includes(searchQuery.toLowerCase())) && <MenuItem value="lad">ལ་དྭགས་སྐད་ (བོད་ཡིག་)<span style={{ display: "none" }}>Ladakhi</span></MenuItem>}
              {(!searchQuery || "prg".includes(searchQuery.toLowerCase())) && <MenuItem value="prg">پرگی &lrm;(نستعلیق)<span style={{ display: "none" }}>Purigi</span></MenuItem>}
              {(!searchQuery || "zan".includes(searchQuery.toLowerCase())) && <MenuItem value="zan">ཟངས་དཀར་སྐད་ (བོད་ཡིག་)<span style={{ display: "none" }}>Zanskari</span></MenuItem>}
              {(!searchQuery || "cng".includes(searchQuery.toLowerCase())) && <MenuItem value="cng">བྱང་ཐང་སྐད་ (བོད་ཡིག་)<span style={{ display: "none" }}>Changthangi</span></MenuItem>}
              {(!searchQuery || "chm".includes(searchQuery.toLowerCase())) && <MenuItem value="chm">चंबियाली (देवनागरी)<span style={{ display: "none" }}>Chambeali</span></MenuItem>}
              {(!searchQuery || "kgr".includes(searchQuery.toLowerCase())) && <MenuItem value="kgr">कांगड़ी (देवनागरी)<span style={{ display: "none" }}>Kangri</span></MenuItem>}
              {(!searchQuery || "kul".includes(searchQuery.toLowerCase())) && <MenuItem value="kul">कुल्लूवी (देवनागरी)<span style={{ display: "none" }}>Kulluvi</span></MenuItem>}
              {(!searchQuery || "mnd".includes(searchQuery.toLowerCase())) && <MenuItem value="mnd">मंडयाली (देवनागरी)<span style={{ display: "none" }}>Mandeali</span></MenuItem>}
              {(!searchQuery || "una".includes(searchQuery.toLowerCase())) && <MenuItem value="una">पंजाबी-पहाड़ी (देवनागरी)<span style={{ display: "none" }}>Punjabi Pahari</span></MenuItem>}
              {(!searchQuery || "bls".includes(searchQuery.toLowerCase())) && <MenuItem value="bls">कहलूरी (देवनागरी)<span style={{ display: "none" }}>Kahluri</span></MenuItem>}
              {(!searchQuery || "sln".includes(searchQuery.toLowerCase())) && <MenuItem value="sln">बघाटी (देवनागरी)<span style={{ display: "none" }}>Baghati</span></MenuItem>}
              {(!searchQuery || "shm".includes(searchQuery.toLowerCase())) && <MenuItem value="shm">महासूवी (देवनागरी)<span style={{ display: "none" }}>Mahasuvi</span></MenuItem>}
              {(!searchQuery || "srm".includes(searchQuery.toLowerCase())) && <MenuItem value="srm">सिरमौरी (देवनागरी)<span style={{ display: "none" }}>Sirmauri</span></MenuItem>}
              {(!searchQuery || "knn".includes(searchQuery.toLowerCase())) && <MenuItem value="knn">किन्नौरी (देवनागरी)<span style={{ display: "none" }}>Kinnauri</span></MenuItem>}
              {(!searchQuery || "maj".includes(searchQuery.toLowerCase())) && <MenuItem value="maj">ਮਾਝੀ (ਗੁਰਮੁਖੀ)<span style={{ display: "none" }}>Majhi</span></MenuItem>}
              {(!searchQuery || "doa".includes(searchQuery.toLowerCase())) && <MenuItem value="doa">ਦੁਆਬੀ (ਗੁਰਮੁਖੀ)<span style={{ display: "none" }}>Doabi</span></MenuItem>}
              {(!searchQuery || "mal".includes(searchQuery.toLowerCase())) && <MenuItem value="mal">ਮਲਵਈ (ਗੁਰਮੁਖੀ)<span style={{ display: "none" }}>Malwai</span></MenuItem>}
              {(!searchQuery || "har".includes(searchQuery.toLowerCase())) && <MenuItem value="har">हरियाणवी (देवनागरी)<span style={{ display: "none" }}>Haryanvi</span></MenuItem>}
              {(!searchQuery || "ahi".includes(searchQuery.toLowerCase())) && <MenuItem value="ahi">अहीरवाटी (देवनागरी)<span style={{ display: "none" }}>Ahirwati</span></MenuItem>}
              {(!searchQuery || "bgi".includes(searchQuery.toLowerCase())) && <MenuItem value="bgi">बागड़ी (देवनागरी)<span style={{ display: "none" }}>Bagri</span></MenuItem>}
              {(!searchQuery || "kau".includes(searchQuery.toLowerCase())) && <MenuItem value="kau">कौरवी (देवनागरी)<span style={{ display: "none" }}>Kauravi</span></MenuItem>}
              {(!searchQuery || "mew".includes(searchQuery.toLowerCase())) && <MenuItem value="mew">मेवाती (देवनागरी)<span style={{ display: "none" }}>Mewati</span></MenuItem>}
              {(!searchQuery || "gar".includes(searchQuery.toLowerCase())) && <MenuItem value="gar">गढ़वाली (देवनागरी)<span style={{ display: "none" }}>Garhwali</span></MenuItem>}
              {(!searchQuery || "kum".includes(searchQuery.toLowerCase())) && <MenuItem value="kum">कुमाऊँनी (देवनागरी)<span style={{ display: "none" }}>Kumaoni</span></MenuItem>}
              {(!searchQuery || "mwr".includes(searchQuery.toLowerCase())) && <MenuItem value="mwr">मारवाड़ी (देवनागरी)<span style={{ display: "none" }}>Marwari</span></MenuItem>}
              {(!searchQuery || "mtr".includes(searchQuery.toLowerCase())) && <MenuItem value="mtr">मेवाड़ी (देवनागरी)<span style={{ display: "none" }}>Mewari</span></MenuItem>}
              {(!searchQuery || "dhd".includes(searchQuery.toLowerCase())) && <MenuItem value="dhd">ढूंढाड़ी (देवनागरी)<span style={{ display: "none" }}>Dhundari</span></MenuItem>}
              {(!searchQuery || "swv".includes(searchQuery.toLowerCase())) && <MenuItem value="swv">शेखावाटी (देवनागरी)<span style={{ display: "none" }}>Shekhawati</span></MenuItem>}
              {(!searchQuery || "hoj".includes(searchQuery.toLowerCase())) && <MenuItem value="hoj">हाड़ौती (देवनागरी)<span style={{ display: "none" }}>Hadoti</span></MenuItem>}
              {(!searchQuery || "wbr".includes(searchQuery.toLowerCase())) && <MenuItem value="wbr">वागड़ी (देवनागरी)<span style={{ display: "none" }}>Wagdi</span></MenuItem>}
              {(!searchQuery || "mlv".includes(searchQuery.toLowerCase())) && <MenuItem value="mlv">मालवी (देवनागरी)<span style={{ display: "none" }}>Malvi</span></MenuItem>}
              {(!searchQuery || "ajm".includes(searchQuery.toLowerCase())) && <MenuItem value="ajm">अजमेरी (देवनागरी)<span style={{ display: "none" }}>Ajmeri</span></MenuItem>}
              {(!searchQuery || "mag".includes(searchQuery.toLowerCase())) && <MenuItem value="mag">मगही (देवनागरी)<span style={{ display: "none" }}>Magahi</span></MenuItem>}
              {(!searchQuery || "ang".includes(searchQuery.toLowerCase())) && <MenuItem value="ang">अंगिका (देवनागरी)<span style={{ display: "none" }}>Angika</span></MenuItem>}
              {(!searchQuery || "sur".includes(searchQuery.toLowerCase())) && <MenuItem value="sur">सुरजापुरी (देवनागरी)<span style={{ display: "none" }}>Surjapuri</span></MenuItem>}
              {(!searchQuery || "mjw".includes(searchQuery.toLowerCase())) && <MenuItem value="mjw">Karbi (Latin)<span style={{ display: "none" }}>Karbi</span></MenuItem>}
              {(!searchQuery || "dis".includes(searchQuery.toLowerCase())) && <MenuItem value="dis">Dimasa (Latin)<span style={{ display: "none" }}>Dimasa</span></MenuItem>}
              {(!searchQuery || "mon".includes(searchQuery.toLowerCase())) && <MenuItem value="mon">མོན་པའི་སྐད་ (བོད་ཡིག་)<span style={{ display: "none" }}>Monpa</span></MenuItem>}
              {(!searchQuery || "njy".includes(searchQuery.toLowerCase())) && <MenuItem value="njy">Nyishi (Latin)<span style={{ display: "none" }}>Nyishi</span></MenuItem>}
              {(!searchQuery || "apt".includes(searchQuery.toLowerCase())) && <MenuItem value="apt">Apatani (Latin)<span style={{ display: "none" }}>Apatani</span></MenuItem>}
              {(!searchQuery || "tgj".includes(searchQuery.toLowerCase())) && <MenuItem value="tgj">Tagin (Latin)<span style={{ display: "none" }}>Tagin</span></MenuItem>}
              {(!searchQuery || "adl".includes(searchQuery.toLowerCase())) && <MenuItem value="adl">Galo (Latin)<span style={{ display: "none" }}>Galo</span></MenuItem>}
              {(!searchQuery || "adi".includes(searchQuery.toLowerCase())) && <MenuItem value="adi">Adi (Latin)<span style={{ display: "none" }}>Adi</span></MenuItem>}
              {(!searchQuery || "clk".includes(searchQuery.toLowerCase())) && <MenuItem value="clk">Idu Mishmi (Latin)<span style={{ display: "none" }}>Idu Mishmi</span></MenuItem>}
              {(!searchQuery || "mxj".includes(searchQuery.toLowerCase())) && <MenuItem value="mxj">Miju Mishmi (Latin)<span style={{ display: "none" }}>Miju Mishmi</span></MenuItem>}
              {(!searchQuery || "mhu".includes(searchQuery.toLowerCase())) && <MenuItem value="mhu">Digaru Mishmi (Latin)<span style={{ display: "none" }}>Digaru Mishmi</span></MenuItem>}
              {(!searchQuery || "kht".includes(searchQuery.toLowerCase())) && <MenuItem value="kht">ၶမ်းတီ (မြန်မာ)<span style={{ display: "none" }}>Tai Khamti</span></MenuItem>}
              {(!searchQuery || "nst".includes(searchQuery.toLowerCase())) && <MenuItem value="nst">Tangsa (Latin)<span style={{ display: "none" }}>Tangsa</span></MenuItem>}
              {(!searchQuery || "njb".includes(searchQuery.toLowerCase())) && <MenuItem value="njb">Nocte (Latin)<span style={{ display: "none" }}>Nocte</span></MenuItem>}
              {(!searchQuery || "nnp".includes(searchQuery.toLowerCase())) && <MenuItem value="nnp">Wancho (Latin)<span style={{ display: "none" }}>Wancho</span></MenuItem>}
              {(!searchQuery || "njm".includes(searchQuery.toLowerCase())) && <MenuItem value="njm">Angami (Latin)<span style={{ display: "none" }}>Angami</span></MenuItem>}
              {(!searchQuery || "nag".includes(searchQuery.toLowerCase())) && <MenuItem value="nag">Nagamese (Latin)<span style={{ display: "none" }}>Nagamese</span></MenuItem>}
              {(!searchQuery || "nsm".includes(searchQuery.toLowerCase())) && <MenuItem value="nsm">Sumi (Latin)<span style={{ display: "none" }}>Sumi</span></MenuItem>}
              {(!searchQuery || "njo".includes(searchQuery.toLowerCase())) && <MenuItem value="njo">Ao (Latin)<span style={{ display: "none" }}>Ao</span></MenuItem>}
              {(!searchQuery || "njh".includes(searchQuery.toLowerCase())) && <MenuItem value="njh">Lotha (Latin)<span style={{ display: "none" }}>Lotha</span></MenuItem>}
              {(!searchQuery || "nri".includes(searchQuery.toLowerCase())) && <MenuItem value="nri">Chakhesang (Latin)<span style={{ display: "none" }}>Chakhesang</span></MenuItem>}
              {(!searchQuery || "nsa".includes(searchQuery.toLowerCase())) && <MenuItem value="nsa">Sangtam (Latin)<span style={{ display: "none" }}>Sangtam</span></MenuItem>}
              {(!searchQuery || "yim".includes(searchQuery.toLowerCase())) && <MenuItem value="yim">Yimkhiung (Latin)<span style={{ display: "none" }}>Yimkhiung</span></MenuItem>}
              {(!searchQuery || "nbc".includes(searchQuery.toLowerCase())) && <MenuItem value="nbc">Chang (Latin)<span style={{ display: "none" }}>Chang</span></MenuItem>}
              {(!searchQuery || "khi".includes(searchQuery.toLowerCase())) && <MenuItem value="khi">Khiamniungan (Latin)<span style={{ display: "none" }}>Khiamniungan</span></MenuItem>}
              {(!searchQuery || "nbe".includes(searchQuery.toLowerCase())) && <MenuItem value="nbe">Konyak (Latin)<span style={{ display: "none" }}>Konyak</span></MenuItem>}
              {(!searchQuery || "nze".includes(searchQuery.toLowerCase())) && <MenuItem value="nze">Zeliang (Latin)<span style={{ display: "none" }}>Zeliang</span></MenuItem>}
              {(!searchQuery || "npo".includes(searchQuery.toLowerCase())) && <MenuItem value="npo">Pochury (Latin)<span style={{ display: "none" }}>Pochury</span></MenuItem>}
              {(!searchQuery || "nmf".includes(searchQuery.toLowerCase())) && <MenuItem value="nmf">Tangkhul (Latin)<span style={{ display: "none" }}>Tangkhul</span></MenuItem>}
              {(!searchQuery || "thd".includes(searchQuery.toLowerCase())) && <MenuItem value="thd">Thadou Kuki (Latin)<span style={{ display: "none" }}>Thadou Kuki</span></MenuItem>}
              {(!searchQuery || "nmo".includes(searchQuery.toLowerCase())) && <MenuItem value="nmo">Mao (Latin)<span style={{ display: "none" }}>Mao</span></MenuItem>}
              {(!searchQuery || "nma".includes(searchQuery.toLowerCase())) && <MenuItem value="nma">Maram (Latin)<span style={{ display: "none" }}>Maram</span></MenuItem>}
              {(!searchQuery || "ron".includes(searchQuery.toLowerCase())) && <MenuItem value="ron">Rongmei (Latin)<span style={{ display: "none" }}>Rongmei</span></MenuItem>}
              {(!searchQuery || "anm".includes(searchQuery.toLowerCase())) && <MenuItem value="anm">Anal (Latin)<span style={{ display: "none" }}>Anal</span></MenuItem>}
              {(!searchQuery || "lus".includes(searchQuery.toLowerCase())) && <MenuItem value="lus">Mizo (Latin)<span style={{ display: "none" }}>Mizo</span></MenuItem>}
              {(!searchQuery || "mrh".includes(searchQuery.toLowerCase())) && <MenuItem value="mrh">Mara (Latin)<span style={{ display: "none" }}>Mara</span></MenuItem>}
              {(!searchQuery || "trp".includes(searchQuery.toLowerCase())) && <MenuItem value="trp">ককবরক (বাংলা)<span style={{ display: "none" }}>Kokborok</span></MenuItem>}
              {(!searchQuery || "sck".includes(searchQuery.toLowerCase())) && <MenuItem value="sck">नागपुरी (देवनागरी)<span style={{ display: "none" }}>Nagpuri</span></MenuItem>}
              {(!searchQuery || "koc".includes(searchQuery.toLowerCase())) && <MenuItem value="koc">खोरठा (देवनागरी)<span style={{ display: "none" }}>Khortha</span></MenuItem>}
              {(!searchQuery || "kyw".includes(searchQuery.toLowerCase())) && <MenuItem value="kyw">कुरमाली (देवनागरी)<span style={{ display: "none" }}>Kurmali</span></MenuItem>}
              {(!searchQuery || "tdb".includes(searchQuery.toLowerCase())) && <MenuItem value="tdb">पंचपरगनिया (देवनागरी)<span style={{ display: "none" }}>Panchpargania</span></MenuItem>}

              {(!searchQuery || "hoc".includes(searchQuery.toLowerCase())) && <MenuItem value="hoc">𑢹𑣗𑣁 (𑢹𑣗𑣁)<span style={{ display: "none" }}>Ho</span></MenuItem>}
              {(!searchQuery || "hne".includes(searchQuery.toLowerCase())) && <MenuItem value="hne">छत्तीसगढ़ी (देवनागरी)<span style={{ display: "none" }}>Chhattisgarhi</span></MenuItem>}
              {(!searchQuery || "sgj".includes(searchQuery.toLowerCase())) && <MenuItem value="sgj">सरगुजिया (देवनागरी)<span style={{ display: "none" }}>Surgujia</span></MenuItem>}
              {(!searchQuery || "hlb".includes(searchQuery.toLowerCase())) && <MenuItem value="hlb">हल्बी (देवनागरी)<span style={{ display: "none" }}>Halbi</span></MenuItem>}
              {(!searchQuery || "gon".includes(searchQuery.toLowerCase())) && <MenuItem value="gon">गोंडी (देवनागरी)<span style={{ display: "none" }}>Gondi</span></MenuItem>}
              {(!searchQuery || "kru".includes(searchQuery.toLowerCase())) && <MenuItem value="kru">कुड़ुख (देवनागरी)<span style={{ display: "none" }}>Kurukh</span></MenuItem>}
              {(!searchQuery || "noe".includes(searchQuery.toLowerCase())) && <MenuItem value="noe">निमाड़ी (देवनागरी)<span style={{ display: "none" }}>Nimadi</span></MenuItem>}
              {(!searchQuery || "mhk".includes(searchQuery.toLowerCase())) && <MenuItem value="mhk">महाकोशली (देवनागरी)<span style={{ display: "none" }}>Mahakosheli</span></MenuItem>}
              {(!searchQuery || "bhb".includes(searchQuery.toLowerCase())) && <MenuItem value="bhb">भीली (देवनागरी)<span style={{ display: "none" }}>Bhili</span></MenuItem>}
              {(!searchQuery || "kvd".includes(searchQuery.toLowerCase())) && <MenuItem value="kvd">કાઠિયાવાડી (ગુજરાતી)<span style={{ display: "none" }}>Kathiyawadi</span></MenuItem>}
              {(!searchQuery || "dac".includes(searchQuery.toLowerCase())) && <MenuItem value="dac">ડાંગી (ગુજરાતી)<span style={{ display: "none" }}>Dangi</span></MenuItem>}
              {(!searchQuery || "sgu".includes(searchQuery.toLowerCase())) && <MenuItem value="sgu">દક્ષિણ ગુજરાતી (ગુજરાતી)<span style={{ display: "none" }}>South Gujarati</span></MenuItem>}
              {(!searchQuery || "kui".includes(searchQuery.toLowerCase())) && <MenuItem value="kui">କୁଇ (ଓଡ଼ିଆ)<span style={{ display: "none" }}>Kui</span></MenuItem>}
              {(!searchQuery || "dso".includes(searchQuery.toLowerCase())) && <MenuItem value="dso">ଦେଶିୟା (ଓଡ଼ିଆ)<span style={{ display: "none" }}>Desiya</span></MenuItem>}
              {(!searchQuery || "tcy".includes(searchQuery.toLowerCase())) && <MenuItem value="tcy">ತುಳು (ಕನ್ನಡ)<span style={{ display: "none" }}>Tulu</span></MenuItem>}
              {(!searchQuery || "kfa".includes(searchQuery.toLowerCase())) && <MenuItem value="kfa">ಕೊಡವ (ಕನ್ನಡ)<span style={{ display: "none" }}>Kodava</span></MenuItem>}

              {(!searchQuery || "es".includes(searchQuery.toLowerCase())) && <MenuItem value="es">Español (Latin)<span style={{ display: "none" }}>Spanish Espanol</span></MenuItem>}
              {(!searchQuery || "fr".includes(searchQuery.toLowerCase())) && <MenuItem value="fr">Français (Latin)<span style={{ display: "none" }}>French Francais</span></MenuItem>}
              {(!searchQuery || "de".includes(searchQuery.toLowerCase())) && <MenuItem value="de">Deutsch (Latin)<span style={{ display: "none" }}>German Deutsch</span></MenuItem>}
              {(!searchQuery || "vi".includes(searchQuery.toLowerCase())) && <MenuItem value="vi">Tiếng Việt (Latin)<span style={{ display: "none" }}>Vietnamese</span></MenuItem>}
              {(!searchQuery || "tr".includes(searchQuery.toLowerCase())) && <MenuItem value="tr">Türkçe (Latin)<span style={{ display: "none" }}>Turkish</span></MenuItem>}
              {(!searchQuery || "id".includes(searchQuery.toLowerCase())) && <MenuItem value="id">Bahasa Indonesia (Latin)<span style={{ display: "none" }}>Indonesian</span></MenuItem>}

              {(!searchQuery || "ru".includes(searchQuery.toLowerCase())) && <MenuItem value="ru">Русский (Кириллица)<span style={{ display: "none" }}>Russian</span></MenuItem>}
              {(!searchQuery || "uk".includes(searchQuery.toLowerCase())) && <MenuItem value="uk">Українська (Кириллица)<span style={{ display: "none" }}>Ukrainian</span></MenuItem>}
              {(!searchQuery || "bg".includes(searchQuery.toLowerCase())) && <MenuItem value="bg">Български (Кириллица)<span style={{ display: "none" }}>Bulgarian</span></MenuItem>}
              {(!searchQuery || "sr".includes(searchQuery.toLowerCase())) && <MenuItem value="sr">Српски (Кириллица)<span style={{ display: "none" }}>Serbian</span></MenuItem>}
              {(!searchQuery || "kk".includes(searchQuery.toLowerCase())) && <MenuItem value="kk">Қазақша (Кириллица)<span style={{ display: "none" }}>Kazakh</span></MenuItem>}
              {(!searchQuery || "mn".includes(searchQuery.toLowerCase())) && <MenuItem value="mn">Монгол (Кириллица)<span style={{ display: "none" }}>Mongolian</span></MenuItem>}

              {(!searchQuery || "el".includes(searchQuery.toLowerCase())) && <MenuItem value="el">Ελληνικά (Ελληνικά)<span style={{ display: "none" }}>Greek</span></MenuItem>}
              
              {(!searchQuery || "hy".includes(searchQuery.toLowerCase())) && <MenuItem value="hy">Հայերեն (Հայերեն)<span style={{ display: "none" }}>Armenian</span></MenuItem>}
              {(!searchQuery || "ka".includes(searchQuery.toLowerCase())) && <MenuItem value="ka">ქართული (ქართული)<span style={{ display: "none" }}>Georgian</span></MenuItem>}

              {(!searchQuery || "th".includes(searchQuery.toLowerCase())) && <MenuItem value="th">ไทย (ไทย)<span style={{ display: "none" }}>Thai</span></MenuItem>}
              {(!searchQuery || "km".includes(searchQuery.toLowerCase())) && <MenuItem value="km">ខ្មែរ (ខ្មែរ)<span style={{ display: "none" }}>Khmer</span></MenuItem>}
              {(!searchQuery || "my".includes(searchQuery.toLowerCase())) && <MenuItem value="my">မြန်မာ (မြန်မာ)<span style={{ display: "none" }}>Burmese Myanmar</span></MenuItem>}

              {(!searchQuery || "fa".includes(searchQuery.toLowerCase())) && <MenuItem value="fa">فارسی &lrm;(عربی)<span style={{ display: "none" }}>Persian Farsi</span></MenuItem>}
              {(!searchQuery || "ps".includes(searchQuery.toLowerCase())) && <MenuItem value="ps">پښتو &lrm;(عربی)<span style={{ display: "none" }}>Pashto</span></MenuItem>}
              {(!searchQuery || "ku".includes(searchQuery.toLowerCase())) && <MenuItem value="ku">Kurdî &lrm;(عربی)<span style={{ display: "none" }}>Kurdish</span></MenuItem>}

              {(!searchQuery || "he".includes(searchQuery.toLowerCase())) && <MenuItem value="he">עברית (עברית)<span style={{ display: "none" }}>Hebrew</span></MenuItem>}
              {(!searchQuery || "yi".includes(searchQuery.toLowerCase())) && <MenuItem value="yi">ייִדיש (עברית)<span style={{ display: "none" }}>Yiddish</span></MenuItem>}

              {(!searchQuery || "zh-cn".includes(searchQuery.toLowerCase())) && <MenuItem value="zh-CN">中文 (汉字)<span style={{ display: "none" }}>Chinese</span></MenuItem>}
              {(!searchQuery || "zh-tw".includes(searchQuery.toLowerCase())) && <MenuItem value="zh-TW">繁體中文 (漢字)<span style={{ display: "none" }}>Chinese Traditional</span></MenuItem>}
              {(!searchQuery || "ja".includes(searchQuery.toLowerCase())) && <MenuItem value="ja">日本語 (仮名/漢字)<span style={{ display: "none" }}>Japanese</span></MenuItem>}
              {(!searchQuery || "ko".includes(searchQuery.toLowerCase())) && <MenuItem value="ko">한국어 (한글)<span style={{ display: "none" }}>Korean</span></MenuItem>}
              {(!searchQuery || "am".includes(searchQuery.toLowerCase())) && <MenuItem value="am">አማርኛ (ግዕዝ)<span style={{ display: "none" }}>Amharic</span></MenuItem>}
            </Select>
          </FormControl>
        </Box>
      </Popover>
    </>
  );
}
