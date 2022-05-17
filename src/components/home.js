import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box,
    Button,
    TextField,
    IconButton,
    Grid,
    Tooltip,
    Autocomplete
} from '@mui/material';
import {
    Delete,
    AddCircle,
    Create
} from '@mui/icons-material';

import Service from '../services/entry.service.js';
import RemedyService from '../services/remedy.service.js';
import EventService from '../services/event.service.js';

const Home = () => {
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

    useEffect(() => {
        if (!events.length && !eventField) {
            retrieveEvents();
        }

        retrieveEntries(page);
    }, [page, refreshData]);

    const renderCells = (params) => {
        return (
            <Grid
                container
                spacing={0}
                alignItems='center'
            >
                <Grid item xs={9}>
                    {params.row.description}
                </Grid >

                <Grid item xs={3}>
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

    const retrieveEvents = async (page) => {
        try {
            const response = await EventService.get();
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
        const ent = {
            dateTime: dateTimeField,
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
            }
        }
    }

    const isEventEqualToValue = (option, value) => {
        return option?._id === value?._id;
    }

    const columns = [
        {
            field: 'dateTime',
            headerName: 'Data e Hora',
            flex: 1
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
            renderCell: renderCells
        },
    ];

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <Box sx={{ p: 5 }}>
                    <DataGrid
                        autoHeight
                        rows={entries}
                        columns={columns}
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

                    {!viewForm ? (
                        <Button
                            sx={{ mt: 2 }}
                            onClick={() => showForm()}
                        >
                            Adicionar Entrada
                        </Button>
                    ) : (
                        <Box style={{ display: 'flex', alignItems: 'center' }} justifyContent='space-around'>
                            <TextField
                                required
                                label='Data e Hora'
                                variant='standard'
                                value={dateTimeField}
                                onChange={(event) => setDateTimeField(event.target.value)}
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
                                disabled={!dateTimeField && !eventField && !descriptionField}
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
                </Box>
            </div>
        </div>
    );
}

export default Home;