import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box,
    Button,
    TextField,
    IconButton,
    Grid,
    Tooltip,
    Autocomplete,
    List,
    ListItem,
    Card,
    CardContent,
    CardActions,
    Typography,
    Fab 
} from '@mui/material';
import {
    Delete,
    AddCircle,
    Create,
    ArrowBack,
    ArrowForward
} from '@mui/icons-material';
import Moment from 'react-moment';
import moment from 'moment';

import Service from '../services/entry.service.js';
import RemedyService from '../services/remedy.service.js';
import EventService from '../services/event.service.js';
import DoseService from '../services/dose.service.js';

import DateHelper from '../helpers/date.helper';

const Home = () => {
    const [currentDate, setCurrentDate] = useState();

    const [rowCountState, setRowCountState] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    const [entries, setEntries] = useState([]);
    const [events, setEvents] = useState([]);
    const [viewForm, setViewForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [dateTimeField, setDateTimeField] = useState('');
    const [eventField, setEventField] = useState('');
    const [descriptionField, setDescriptionField] = useState('');
    const [remedies, setRemedies] = useState([]);

    useEffect(() => {
        const today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        setCurrentDate(today);

        retrieveEvents();
    }, []);

    useEffect(() => {
        retrieveRemedies();
    }, [currentDate]);

    useEffect(() => {
        retrieveEntries(page);
    }, [page, refreshData]);

    const renderDateCell = (params) => {
        return (
            <Box
                container
                spacing={0}
                alignItems='center'
            >
                <Moment format='DD/MM/YYYY HH:mm'>
                    {params.row.dateTime}
                </Moment>
            </Box>
        );
    }

    const renderActionCells = (params) => {
        return (
            <Grid
                container
                spacing={0}
                alignItems='center'
            >
                <Grid item xs={8}>
                    {params.row.description}
                </Grid >

                <Grid item xs={4}>
                    <Tooltip title='Editar' placement='top-start'>
                        <IconButton
                            aria-label='Editar'
                            color='primary'
                            onClick={() => {
                                editEntry(params.row);
                            }}
                        >
                            <Create />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title='Remover' placement='top-start'>
                        <IconButton
                            aria-label='Remover'
                            color='error'
                            onClick={() => {
                                removeEntry(params.row.id);
                            }}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Grid >
            </Grid >
        )
    }

    const retrieveRemedies = async () => {
        const response = await RemedyService.getByDate(currentDate);
        const responseData = response.data;
        const rmds = responseData.result;

        const doses = [];
        rmds.forEach(rmd => {

        });

        setRemedies(rmds);
    }

    const retrieveEntries = async (page) => {
        try {
            const response = await Service.get(page, 10);
            const responseData = response.data;
            const count = responseData.count;
            const ents = responseData.result;

            ents.forEach(el => {
                el['id'] = el['_id'];
            });

            setEntries(ents);
            setLoading(false);

            if (count) {
                setRowCountState(count);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const retrieveEvents = async (description = null) => {
        try {
            const response = await EventService.getByDescription(description);
            await setEvents(response.data.result);
            setLoading(false);
        } catch (err) {
            console.log(err);
        }
    }

    const removeEntry = async (id) => {
        try {
            await Service.delete(id);
            setRefreshData(!refreshData);
        } catch (err) {
            console.log(err);
        }
    }

    const editEntry = (ent) => {
        setEditId(ent.id);
        showForm(ent);
    }

    const save = () => {
        const dateTimeArr = dateTimeField.split(' ');

        const dateArray = dateTimeArr[0].split('/');
        const day = dateArray[0];
        const month = dateArray[1] - 1;
        const year = dateArray[2];

        const timeArr = dateTimeArr[1].split(':');
        const hours = timeArr[0];
        const minutes = timeArr[1];

        console.log(year, month, day, hours, minutes);
        const dt = new Date(year, month, day, hours, minutes).toLocaleString('en-US', {
            hour12: false,
        });
        console.log(dt);

        const ent = {
            dateTime: dt,
            event: eventField,
            description: descriptionField
        }

        if (editId) {
            Service.update(editId, ent).then(response => {
                setRefreshData(!refreshData);
                closeForm();
            }).catch(err => {
                console.log(err);
            });
        } else {
            Service.create(ent).then(response => {
                setRefreshData(!refreshData);
                closeForm();
            }).catch(err => {
                console.log(err);
            });
        }
    }

    const closeForm = () => {
        setEditId(null);
        setDateTimeField('');
        setEventField(null);
        setDescriptionField('');
        setViewForm(false);
    }

    const showForm = (ent) => {
        setViewForm(true);
        setDateTimeField('');
        setEventField(null);
        setDescriptionField('');
    }

    const getEventsDescription = (evt) => {
        return evt ? evt.description : '';
    }

    const onEventAutoCompleteInputChanges = (event) => {
        if (event) {
            const value = event?.target.value;
            if (value?.length > 1) {
                if (events.indexOf(evt => evt.description.toLowerCase().includes(value.toLowerCase())) === -1) {
                    retrieveEvents(value);
                }
            } else {
                retrieveEvents();
            }
        }
    }

    const isEventEqualToValue = (option, value) => {
        return option?._id === value?._id;
    }

    const changeCurrentDate = (value) => {
        const newDate = moment(currentDate).add(value, 'days').toDate();
        setCurrentDate(newDate);
    }

    const onChangeDateTime = (event) => {
        const dateTime = DateHelper.formatDateTime(event.target.value);;
        setDateTimeField(dateTime);
    }

    const diaryColumns = [
        {
            field: 'dateTime',
            headerName: 'Data e Hora',
            flex: 1,
            renderCell: renderDateCell
        },
        {
            field: 'event',
            valueFormatter: (params) => params.value?.description,
            headerName: 'Evento',
            flex: 1
        },
        {
            field: 'description',
            headerName: '',
            flex: 1,
            renderCell: renderActionCells
        },
    ];

    const generateDosesButtons = async (rmd) => {
        const response = await DoseService.getByRmd(rmd, currentDate);
        const doses = response.data.result;

        const fabBtns = [...Array(parseInt(rmd.frequency, 10)).keys()].map(f => {
            const btnName = 'D' + (f + 1);

            const appliedDose = doses.find((doseName) => doseName === btnName);

            return(
                <Fab key={'fabfreq' + f} size='small' sx={f !== 0 ? { ml: 1 } : {}}>
                    {btnName}
                </Fab>
            );
        });
        
        return fabBtns;
    }

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <Box sx={{ p: 5 }}>
                    <Grid container spacing={1}>
                        <Grid item xs={8}>
                            <Card>
                                <CardContent>
                                    <div style={{ textAlign: 'center' }}>
                                        <h1>Diário do Braia</h1>
                                    </div>
                                    <DataGrid
                                        autoHeight
                                        rows={entries}
                                        columns={diaryColumns}
                                        pagination
                                        pageSize={10}
                                        disableSelectionOnClick
                                        paginationMode='server'
                                        rowsPerPageOptions={[10]}
                                        rowCount={rowCountState}
                                        onPageChange={(newPage) => setPage(newPage)}
                                        page={page}
                                        loading={loading}
                                    />
                                </CardContent>
                                <CardActions>
                                    {!viewForm ? (
                                        <Button
                                            sx={{ mt: 2 }}
                                            onClick={() => showForm()}
                                        >
                                            Adicionar Entrada
                                        </Button>
                                    ) : (
                                        <Box style={{ display: 'flex', alignItems: 'center' }} >
                                            <TextField
                                                sx={{ display: { lg: 'block', sm: 'none', md: 'none' } }}
                                                required
                                                label='Data e Hora'
                                                variant='standard'
                                                value={dateTimeField}
                                                onChange={onChangeDateTime}
                                            />

                                            <Autocomplete
                                                disablePortal
                                                id="autocomplete-events"
                                                options={events}
                                                noOptionsText='Não encontrado'
                                                loadingText='Carregando...'
                                                disableClearable
                                                getOptionLabel={getEventsDescription}
                                                sx={{ m: 1, minWidth: 300 }}
                                                onInputChange={onEventAutoCompleteInputChanges}
                                                renderInput={(params) => <TextField {...params} label="Evento" variant='standard' />}
                                                value={eventField}
                                                onChange={(event, evt) => {
                                                    setEventField(evt);
                                                }}
                                                isOptionEqualToValue={isEventEqualToValue}
                                            />

                                            <TextField
                                                sx={{ minWidth: 300 }}
                                                required
                                                label='Descrição'
                                                variant='standard'
                                                value={descriptionField}
                                                onChange={(event) => setDescriptionField(event.target.value)}
                                            />
                                            <Button
                                                sx={{ mt: 2, ml: 2 }}
                                                variant='outlined'
                                                startIcon={<AddCircle />}
                                                onClick={() => save()}
                                                disabled={!dateTimeField && dateTimeField.length !== 16 && !eventField && !descriptionField}
                                            >
                                                Salvar
                                            </Button>
                                            <Button
                                                sx={{ mt: 2, ml: 2 }}
                                                variant='contained'
                                                color='error'
                                                onClick={() => closeForm()}
                                            >
                                                Cancelar
                                            </Button>
                                        </Box>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={4}>
                            <Card>
                                <CardContent>
                                    <div style={{ textAlign: 'center' }}>
                                        <h1>Checklist de remédios</h1>
                                        <Grid container spacing={1}>
                                            <Grid item xs={4}>
                                                <IconButton onClick={() => changeCurrentDate(-1)}>
                                                    <ArrowBack />
                                                </IconButton>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <h3>
                                                    <Moment format='DD/MM/YYYY'>
                                                        {currentDate}
                                                    </Moment>
                                                </h3>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <IconButton onClick={() => changeCurrentDate(1)}>
                                                    <ArrowForward />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </div>
                                    <Box sx={{ display: 'inline-flex' }}>
                                        <List dense={true}>
                                            {remedies.map(rmd => {
                                                return (
                                                    <ListItem key={`rmd${rmd._id}`}>
                                                        <Card sx={{ minWidth: 300 }}>
                                                            <CardContent>
                                                                <Typography align='center'>
                                                                    {rmd.name}
                                                                </Typography>
                                                                <Box textAlign='center' sx={{ mt: 1 }} >
                                                                    {generateDosesButtons(rmd)}
                                                                </Box>
                                                            </CardContent>
                                                        </Card>
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </div>
        </div >
    );
}

export default Home;