import { Box, Button, CircularProgress, Divider, Grid, IconButton, List, ListItem, Modal, Paper, TextField, Typography } from '@mui/material'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { deleteMedia, deleteUser, getGenres, getListedData, getMediaReviewsData, getUserReviews, getUserViewLogs, putMediaData, putUserData } from '../api'
import DataField from './DataField'
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { Delete } from '@mui/icons-material';
import DatePicker from 'react-date-picker';

export default function MediasModal(props) {

  const data = props.data;

  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(JSON.parse(JSON.stringify(data)));
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(data)));
  const [genres, setGenres] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [reviewData, setReviewData] = useState({ liked: 0, disliked: 0 })
  const [listedData, setListedData] = useState({ count: 0 });

  const handleDelete = async () => {
    await deleteMedia(data._id);
    props.onClose();
  }

  const handleEdit = () => {
    setOriginalData(JSON.parse(JSON.stringify(formData)));
    setIsEditing(true);
  }

  const handleOnChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  const handleCancelEdit = () => {
    setFormData(JSON.parse(JSON.stringify(originalData)));
    setIsEditing(false);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsEditing(false);
    await putMediaData(data._id, formData);
    if (formData['title'] !== originalData['title']) {
      data['title'] = formData['title'];
    }
    if (formData['type'] !== originalData['type']) {
      data['type'] = formData['type'];
    }
    if (formData['production'] !== originalData['production']) {
      data['production'] = formData['production'];
    }
    data['media_src'] = formData['media_src'];
    console.log('Done!');
  }

  const handleSeasonClick = (index) => {
    setSelectedSeason(index);
  }

  const handleDeleteSeason = (index) => {
    if (index <= selectedSeason) setSelectedSeason( prev => prev - 1 )
    const mediaSrc = JSON.parse(JSON.stringify(formData.media_src));
    mediaSrc.splice(index, 1);
    setFormData({ ...formData, media_src: mediaSrc })
  }

  const handleAddSeason = () => {
    const mediaSrc = JSON.parse(JSON.stringify(formData.media_src));
    mediaSrc.push([ { title: '', src: '' } ]);
    setFormData({ ...formData, media_src: mediaSrc })
  }

  const handleDeleteEpisode = (index) => {
    const mediaSrc = JSON.parse(JSON.stringify(formData.media_src));
    mediaSrc[selectedSeason].splice(index, 1);
    setFormData({ ...formData, media_src: mediaSrc })
  }

  const handleAddEpisode = () => {
    const newEpisode = {
      title: '',
      src: '',
    }
    const mediaSrc = JSON.parse(JSON.stringify(formData.media_src));
    mediaSrc[selectedSeason].push(newEpisode);
    setFormData({ ...formData, media_src: mediaSrc })
  }

  const handleSrcChange = (event, season, episode) => {
    const newSrc = formData.media_src;
    newSrc[season][episode].src = event.target.value;
    setFormData({ ...formData, media_src: newSrc });
  }

  const handleEpisodeTitleChange = (event, season, episode) => {
    const newTitle = formData.media_src;
    newTitle[season][episode].title = event.target.value;
    setFormData({ ...formData, media_src: newTitle });
  }

  const handleListChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value.split(',') });
  }

  const handleGenreChange = (value) => {
    // const selectedGenres = value.map( genre => ({ name: genre }) );
    const selectedGenres = value.map( selectedGenre => {
      return genres.find( genre => genre.name === selectedGenre )
    } );
    setFormData({ ...formData, genres: selectedGenres });
  }

  const handleDateChange = (date, fieldName) => {
    setFormData({ ...formData, [fieldName]: date })
  }

  useEffect( () => {
    const fetchGenres = async () => {
      const res = await getGenres();
      const genres = res.data;
      setGenres(genres);
    }

    const fetchLiked = async () => {
      const res = await getMediaReviewsData(data._id);
      setReviewData(res.data);
    }

    const fetchListed = async () => {
      const res = await getListedData(data._id);
      setListedData(res.data);
    }

    fetchGenres();
    fetchLiked();
    fetchListed();
  }, [])

  return (
    <Paper sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      height: '600px',
      width: '680px',
      overflow: 'auto',

      padding: 4,
      scrollbarWidth: 'thin',
    }}
    >
      <Typography variant={'h4'} >Media details</Typography>
      <form >
        <Box sx={{ padding: '8px', display: 'flex', justifyContent: 'flex-end' }} >
          {
            (isEditing) ? 
              <>
                <Button color='secondary' variant='contained' sx={{ width: '80px', mr: 2 }} onClick={handleSubmit} >Save</Button>
                <Button color='secondary' variant='contained' sx={{ width: '80px', }} onClick={handleCancelEdit} >Cancel</Button>
              </>
            :
              <>
                <Button color='secondary' onClick={handleEdit} variant='contained' sx={{ width: '80px', mr: 2 }} type='button' >Edit</Button>
                <Button color='secondary' onClick={handleDelete} variant='contained' sx={{ width: '80px', }} type='button' >Delete</Button>
              </>
          }
        </Box>
        <Divider sx={{ width: '100%' }}/>
        <Box>
          <Grid container spacing={1}>

            <DataField name='title' type='text' label='Title' value={formData ? formData.title : '' } isEditing={isEditing} onChange={handleOnChange} />
            {/* <DataField name='release_date' type='text' label='Released' value={formData ? stringifyDate(formData.release_date) : '' } isEditing={isEditing} onChange={handleDateChange} /> */}
            <DataField name='release_date' type='custom' label='Released'>
              <DatePicker value={new Date(formData.release_date)} disabled={!isEditing} onChange={(date) => handleDateChange(date, 'release_date')} />
            </DataField>
            <DataField name='type' type='select' selectValues={['Movie', 'Show']} label='Type' value={formData ? formData.type : '' } isEditing={isEditing} onChange={handleOnChange} />
            <DataField name='poster' type='text' label='Poster' value={formData ? formData.poster : ''}  isEditing={isEditing} onChange={handleOnChange} />
            <DataField name='poster_img' type='custom' label=''>
              <Box component="img" src={formData.poster ?? ''} maxWidth='150px' sx={{ minHeight: '225px' }}/>
            </DataField>
            <DataField name='genres' type='multipleSelect' label='Genres' selectValues={genres.map( genre => genre.name )} value={formData ? formData.genres.map( genre => genre.name ) : [] } isEditing={isEditing} onChange={handleGenreChange} />
            <DataField name='overview' type='textArea' label='Overview' value={formData ? formData.overview : '' } isEditing={isEditing} onChange={handleOnChange} />
            <DataField name='production' type='text' label='Production' value={formData ? formData.production : '' } isEditing={isEditing} onChange={handleOnChange} />
            <DataField name='director' type='text' label='Director(s)' value={formData ? formData.director.join(',') : ''} isEditing={isEditing} onChange={handleListChange} />
            <DataField name='cast' type='text' label='Cast' value={formData ? formData.cast.join(',') : ''} isEditing={isEditing} onChange={handleListChange} />
            {/* <DataField name='updated' type='text' label='Last updated' value={formData ? stringifyDate(formData.updated) : '' } isEditing={false} onChange={(date) => handleDateChange(date, 'updated')} /> */}
            <DataField name='updated' type='custom' label='Released'>
              <DatePicker value={new Date(formData.updated)} disabled={!isEditing} onChange={(date) => handleDateChange(date, 'updated')} />
            </DataField>
            {
              (formData.type === 'Movie') ?
                <>
                  <DataField name='media_src' type='text' label='Source' value={formData ? formData.media_src[0][0].src : ''} isEditing={isEditing} onChange={(event) => handleSrcChange(event, 0, 0)} />
                  <DataField name='runtime' type='number' label='Duration' value={formData ? formData.runtime : '' } isEditing={isEditing} onChange={handleOnChange} />
                </>
              :
                <DataField name='media_src' type='custom' label='Episodes'>
                  <Box display='flex' >
                    <Box sx={{ maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' , scrollbarWidth: 'thin', marginRight: '8px' }}>
                      {
                        formData.media_src.map( (season, index) => {
                          return (
                            <Box key={`season.${index + 1}`} display='flex' width='150px' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography onClick={() => handleSeasonClick(index)} sx={{ cursor: 'pointer', fontWeight: (index === selectedSeason) ? 600 : 400 }}>Season {index + 1}</Typography>
                              <IconButton size='large' color='secondary' disabled={formData.media_src.length === 1 || !isEditing} onClick={() => handleDeleteSeason(index)}>
                                <Delete fontSize='small' sx={{  }} />
                              </IconButton>
                              {/* <Button color='secondary' variant='contained' size='small' ><Delete fontSize='small' sx={{ padding: '4px' }} /></Button> */}
                            </Box>
                          )
                        })
                      }
                      <Button color='secondary' variant='contained' disabled={!isEditing} onClick={handleAddSeason} >Add season</Button>
                    </Box>
                    <Box sx={{ maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' , scrollbarWidth: 'thin', paddingRight: '8px' }}>
                      {
                        formData.media_src[selectedSeason]?.map( (episode, index) => {
                          return (
                            <Box key={`episode${index + 1}`} >
                              <Box display='flex' width='300px' sx={{ justifyContent: 'space-between', alignItems: 'center' }} >
                                <Box>
                                  <Typography sx={{ fontWeight: 600 }} >{`Episode ${index + 1}`}</Typography>
                                  <TextField
                                    value={formData.media_src[selectedSeason][index].title}
                                    label= { formData.media_src[selectedSeason][index].title ? ' ' : 'Title'}
                                    InputLabelProps={{ shrink: false }}
                                    disabled= {!isEditing}
                                    sx={{
                                      width: '100%',
                                      "& .MuiInputBase-input": { // For text color
                                        color: 'secondary.dark',
                                      },
                                      "& .MuiInputBase-input.Mui-disabled": {
                                        WebkitTextFillColor: 'black'
                                      } 
                                    }}
                                    InputProps={{ disableUnderline: (!isEditing), autoComplete: 'new-password' }}
                                    variant='standard'
                                    onChange={(event) => handleEpisodeTitleChange(event, selectedSeason, index)}
                                  />
                                  <TextField
                                    // value={episode.src}
                                    value={formData.media_src[selectedSeason][index].src}
                                    disabled= {!isEditing}
                                    label= { formData.media_src[selectedSeason][index].src ? ' ' : 'Path to source'}
                                    InputLabelProps={{ shrink: false }}
                                    sx={{
                                      width: '100%',
                                      "& .MuiInputBase-input": { // For text color
                                        color: 'secondary.dark',
                                      },
                                      "& .MuiInputBase-input.Mui-disabled": {
                                        WebkitTextFillColor: 'black'
                                      },
                                      mb: '2px',
                                    }}
                                    InputProps={{ disableUnderline: (!isEditing), autoComplete: 'new-password' }}
                                    variant='standard'
                                    onChange={(event) => handleSrcChange(event, selectedSeason, index)}
                                  />
                                </Box>
                                <IconButton size='large' color='secondary' disabled={formData.media_src[selectedSeason].length === 1 || !isEditing} onClick={() => handleDeleteEpisode(index)}>
                                  <Delete fontSize='small' sx={{  }} />
                                </IconButton>
                              </Box>
                              <Divider sx={{ width: '100%' }} />
                            </Box>
                          )
                        })
                      }
                      <Button color='secondary' variant='contained' disabled={!isEditing} onClick={handleAddEpisode} >Add episode</Button>
                    </Box>
                  </Box>
                </DataField>
            }

            <Divider sx={{ width: '100%' }}/>

            <DataField name='review_data' type='text' label='Review data' value={`Liked: ${reviewData.liked} / Disliked: ${reviewData.disliked}`} />

            <DataField name='listed_data' type='text' label='Listed data' value={`Currently in ${listedData.count} list(s).`} />

          </Grid>
        </Box>
      </form>
    </Paper>
  )
}
