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

import Service from '../services/remedy.service';

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

    const renderCells = (params) => {
        return (
            <Grid
                container
                spacing={0}
                alignItems='center'
            >
                <Grid item xs={9}>
                    {params.row.frequency}
                </Grid >

                <Grid item xs={3}>
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
        const rmd = {
            name: nameField,
            dosage: dosageField.replace(',', '.'),
            unit: unitField,
            frequency: frequencyField
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
        setViewForm(false);
    }

    const showForm = (rmd) => {
        setViewForm(true);
        setNameField(rmd?.name || '');
        setDosageField(rmd?.dosage.toString().replace('.', ',') || '');
        setUnitField(rmd?.unit || 'mg');
        setFrequencyField(rmd?.frequency || '');
    }

    const onChangeDosage = (event) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        let counter = 0;

        const valueArray = value.split('');
        let newValueArray = [];

        while (valueArray[0] === '0') {
            valueArray.shift();
        }

        while (valueArray.length < 1) {
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
            field: 'frequency',
            headerName: 'Vezes ao dia',
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
                        <Box style={{ display: 'flex', alignItems: 'center' }} justifyContent='space-around'>
                            <TextField
                                required
                                label='Nome'
                                variant='standard'
                                value={nameField}
                                onChange={(event) => setNameField(event.target.value)}
                            />

                            <TextField
                                required
                                label='Dosagem'
                                variant='standard'
                                value={dosageField}
                                onChange={onChangeDosage}
                            />

                            <FormControl sx={{ m: 1, minWidth: 100 }}>
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

                            <TextField
                                required
                                label='Frequência ao dia'
                                variant='standard'
                                value={frequencyField}
                                onChange={onChangeFrequency}
                            />
                            <Button
                                sx={{ mt: 2, ml: 2 }}
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