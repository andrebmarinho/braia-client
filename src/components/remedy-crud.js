import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box,
    Button,
    TextField,
    IconButton,
    Grid,
    Tooltip,
    InputLabel,
    Select,
    MenuItem,
    FormControl
} from '@mui/material';
import {
    Delete,
    AddCircle,
    Create
} from '@mui/icons-material';
import Moment from 'react-moment';
import moment from 'moment';

import Service from '../services/remedy.service';
import DateHelper from '../helpers/date.helper';

const units = ['mg', 'ml', 'comprimido', 'cápsula'];

const RemedyCrud = () => {
    const [rowCountState, setRowCountState] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    const [remedies, setRemedies] = useState([]);
    const [viewForm, setViewForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [nameField, setNameField] = useState('');
    const [dosageField, setDosageField] = useState('');
    const [unitField, setUnitField] = useState('mg');
    const [frequencyField, setFrequencyField] = useState('');
    const [startDateField, setStartDateField] = useState('');
    const [periodField, setPeriodField] = useState('');

    useEffect(() => {
        retrieveRemedies(page);
    }, [page, refreshData]);

    const formatDosageString = (params) => {
        let unit = params.row.unit;
        let dosage = params.row.dosage.toString().replace('.', ',');
        let dosageStr = dosage + ' ' + unit;

        if (dosage > 1) {
            if (unit === 'comprimido' || unit === 'cápsula') {
                return dosageStr + 's';
            }
        }

        return dosageStr;
    }

    const renderDateCell = (params) => {
        return (
            <Box
                container
                spacing={0}
                alignItems='center'
            >
                <Moment format='DD/MM/YYYY'>
                    {params.value}
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
                <Grid item xs={6}>
                    {params.row.frequency}
                </Grid >

                <Grid item xs={6}>
                    <Tooltip title='Editar' placement='top-start'>
                        <IconButton
                            aria-label='Editar'
                            color='primary'
                            onClick={() => {
                                editRemedy(params.row);
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
                                removeRemedy(params.row.id);
                            }}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Grid >
            </Grid >
        )
    }

    const retrieveRemedies = async (page) => {
        try {
            const response = await Service.get(page, 10);
            const responseData = response.data;
            const count = responseData.count;
            const rmds = responseData.result;

            rmds.forEach(el => {
                el['id'] = el['_id'];
            });

            setRemedies(rmds);
            setLoading(false);

            if (count) {
                setRowCountState(count);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const removeRemedy = async (id) => {
        try {
            await Service.delete(id);
            setRefreshData(!refreshData);
        } catch (err) {
            console.log(err);
        }
    }

    const editRemedy = (rmd) => {
        setEditId(rmd.id);
        showForm(rmd);
    }

    const save = () => {
        const dateArray = startDateField.split('/');
        const day = dateArray[0];
        const month = dateArray[1] - 1;
        const year = dateArray[2];
        const startDate = new Date(year, month, day);
        const period = parseInt(periodField, 10);
        const endDate = moment(startDate).add(period - 1, 'days').toDate();

        const rmd = {
            name: nameField,
            dosage: dosageField.replace(',', '.'),
            unit: unitField,
            frequency: frequencyField,
            startDate: startDate,
            endDate: endDate
        }

        if (editId) {
            Service.update(editId, rmd).then(response => {
                setRefreshData(!refreshData);
                closeForm();
            }).catch(err => {
                console.log(err);
            });
        } else {
            Service.create(rmd).then(response => {
                setRefreshData(!refreshData);
                closeForm();
            }).catch(err => {
                console.log(err);
            });
        }
    }

    const closeForm = () => {
        setEditId(null);
        setNameField('');
        setDosageField('');
        setUnitField('mg');
        setFrequencyField('');
        setStartDateField('');
        setPeriodField('');
        setViewForm(false);
    }

    const showForm = (rmd) => {
        setNameField(rmd?.name || '');
        setDosageField(rmd?.dosage.toString().replace('.', ',') || '');
        setUnitField(rmd?.unit || 'mg');
        setFrequencyField(rmd?.frequency || '');
        setStartDateField(rmd ? moment(rmd.startDate).format('DD/MM/YYYY') : '');

        let period = '';
        if (rmd) {
            period = moment(rmd.endDate).diff(moment(rmd.startDate), 'days') + 1;
        }

        setPeriodField(period);
        setViewForm(true);
    }

    const onChangeDosage = (event) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        let counter = 0;

        const valueArray = value.split('');
        let newValueArray = [];

        while (valueArray[0] === '0') {
            valueArray.shift();
        }

        while (valueArray.length < 2) {
            valueArray.unshift('0');
        }

        while (valueArray.length > 0) {
            counter++;

            const valueAux = valueArray.pop();
            if (valueAux) {
                newValueArray.push(valueAux);
            }

            if (counter === 1) {
                newValueArray.push(',');
            }
        }

        newValueArray = newValueArray.reverse();

        setDosageField(newValueArray.join(''));
    }

    const onChangeFrequency = (event) => {
        setFrequencyField(event.target.value.replace(/[^0-9]/g, ''));
    }

    const onChangePeriod = (event) => {
        setPeriodField(event.target.value.replace(/[^0-9]/g, ''));
    }

    const onChangeStartDate = (event) => {
        const startDate = DateHelper.formatDate(event.target.value);;
        setStartDateField(startDate);
    }

    const columns = [
        {
            field: 'name',
            headerName: 'Remédio',
            flex: 1
        },
        {
            field: 'dosage',
            valueGetter: formatDosageString,
            headerName: 'Dosagem',
            flex: 1
        },
        {
            field: 'startDate',
            headerName: 'Data de início',
            flex: 1,
            renderCell: renderDateCell
        },
        {
            field: 'endDate',
            headerName: 'Data fim',
            flex: 1,
            renderCell: renderDateCell
        },
        {
            field: 'frequency',
            headerName: 'Vezes ao dia',
            flex: 1,
            renderCell: renderActionCells
        }
    ];

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <Box sx={{ p: 5 }}>
                    <DataGrid
                        autoHeight
                        rows={remedies}
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
                            Adicionar remédio
                        </Button>
                    ) : (
                        <Box  >
                            <Box style={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    required
                                    label='Nome'
                                    variant='standard'
                                    value={nameField}
                                    onChange={(event) => setNameField(event.target.value)}
                                />

                                <TextField
                                    sx={{ ml: 1 }}
                                    required
                                    label='Dosagem'
                                    variant='standard'
                                    value={dosageField}
                                    onChange={onChangeDosage}
                                />

                                <FormControl sx={{ ml: 1, minWidth: 100 }}>
                                    <InputLabel id='select-unit-label'>Unidade</InputLabel>
                                    <Select
                                        id='select-unit'
                                        labelId='select-unit-label'
                                        value={unitField}
                                        variant='standard'
                                        onChange={(event) => setUnitField(event.target.value)}>
                                        {units.map(unit => {
                                            return (
                                                <MenuItem key={unit} value={unit}>
                                                    {unit}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box style={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    required
                                    label='Frequência diária'
                                    variant='standard'
                                    value={frequencyField}
                                    onChange={onChangeFrequency}
                                />

                                <TextField
                                    sx={{ ml: 1, display: { lg: 'block', sm: 'none', md: 'none' } }}
                                    required
                                    label='Data de início'
                                    variant='standard'
                                    value={startDateField}
                                    onChange={onChangeStartDate}
                                />

                                <TextField
                                    sx={{ ml: 1 }}
                                    required
                                    label='Período em dias'
                                    variant='standard'
                                    value={periodField}
                                    onChange={onChangePeriod}
                                />
                            </Box>
                            <Button
                                sx={{ mt: 2 }}
                                variant='outlined'
                                startIcon={<AddCircle />}
                                onClick={() => save()}
                                disabled={!nameField && !dosageField && !unitField && !frequencyField}
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

export default RemedyCrud;