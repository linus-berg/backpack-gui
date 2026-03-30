import React, { useState } from 'react';
import {
  Dialog,
  Button,
  Intent,
  Classes,
  FormGroup,
  InputGroup,
  HTMLSelect,
  Callout,
  HTMLTable,
  Icon,
} from '@blueprintjs/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { Schedule } from 'types/Schedule';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SchedulerManagerDialog = ({ isOpen, onClose }: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const [editingSchedule, setEditingSchedule] = useState<Partial<Schedule> | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [nextOccurrences, setNextOccurrences] = useState<string[]>([]);

  const { data: schedules, isLoading } = useQuery(['schedules'], backpack.GetSchedules);
  const { data: processors } = useQuery(['processors'], backpack.GetAllProcessors);

  const validateMutation = useMutation(backpack.ValidateSchedule, {
    onSuccess: (data: any) => {
      if (data.data.valid) {
        setValidationError(null);
        setNextOccurrences(data.data.nextOccurrences);
      }
    },
    onError: (err: any) => {
      setValidationError(err.response?.data?.error || 'Invalid Cron Expression');
      setNextOccurrences([]);
    },
  });

  const addMutation = useMutation(backpack.AddSchedule, {
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      setEditingSchedule(null);
      setValidationError(null);
      setNextOccurrences([]);
    },
  });

  const updateMutation = useMutation(backpack.UpdateSchedule, {
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      setEditingSchedule(null);
      setValidationError(null);
      setNextOccurrences([]);
    },
  });

  const deleteMutation = useMutation(backpack.DeleteSchedule, {
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
    },
  });

  React.useEffect(() => {
    if (editingSchedule?.cron && editingSchedule.cron.split(' ').length >= 6) {
      const timer = setTimeout(() => {
        validateMutation.mutate(editingSchedule as Schedule);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [editingSchedule?.cron]);

  const handleSave = () => {
    if (!editingSchedule?.processor || !editingSchedule?.cron) {
      setValidationError('Processor and Cron are required');
      return;
    }
    
    if (validationError) return;

    if (editingSchedule?.id) {
      updateMutation.mutate(editingSchedule as Schedule);
    } else {
      addMutation.mutate(editingSchedule as Schedule);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setValidationError(null);
    validateMutation.mutate(schedule);
  };

  const handleAddNew = () => {
    const newSchedule = { cron: '0 0 * * * ?', processor: '' };
    setEditingSchedule(newSchedule);
    setValidationError(null);
    validateMutation.mutate(newSchedule as Schedule);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Tracking Schedules"
      style={{ width: '800px' }}
    >
      <div className={Classes.DIALOG_BODY}>
        {editingSchedule ? (
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h4>{editingSchedule.id ? 'Edit Schedule' : 'Add New Schedule'}</h4>
            <FormGroup label="Processor" labelFor="processor-select">
              <HTMLSelect
                id="processor-select"
                value={editingSchedule.processor}
                onChange={e => setEditingSchedule({ ...editingSchedule, processor: e.target.value })}
              >
                <option value="">Select a processor...</option>
                {processors?.data.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id}
                  </option>
                ))}
              </HTMLSelect>
            </FormGroup>
            <FormGroup 
                label="Cron Expression (with seconds)" 
                labelFor="cron-input"
                helperText="Format: second minute hour day-of-month month day-of-week"
            >
              <InputGroup
                id="cron-input"
                value={editingSchedule.cron}
                onChange={e => setEditingSchedule({ ...editingSchedule, cron: e.target.value })}
                placeholder="0 0 * * * ?"
              />
            </FormGroup>
            {validationError && (
              <Callout intent={Intent.DANGER} title="Validation Error" style={{ marginBottom: '10px' }}>
                {validationError}
              </Callout>
            )}
            {!validationError && nextOccurrences.length > 0 && (
              <Callout intent={Intent.SUCCESS} title="Schedule Preview" style={{ marginBottom: '10px' }}>
                <p>This schedule will run at:</p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {nextOccurrences.map((occ, i) => (
                    <li key={i}>
                      {new Date(occ).toLocaleString()}
                      {i === 0 && (
                        <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                          (Next run)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                {nextOccurrences.length > 1 && (
                    <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                        Approximate interval: {Math.round((new Date(nextOccurrences[1]).getTime() - new Date(nextOccurrences[0]).getTime()) / 1000 / 60)} minutes
                    </div>
                )}
              </Callout>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button onClick={() => setEditingSchedule(null)}>Cancel</Button>
              <Button 
                intent={Intent.SUCCESS} 
                onClick={handleSave}
                loading={validateMutation.isLoading || addMutation.isLoading || updateMutation.isLoading}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <Button icon="add" intent={Intent.PRIMARY} onClick={handleAddNew} style={{ marginBottom: '15px' }}>
            Add New Schedule
          </Button>
        )}

        <HTMLTable striped condensed style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Processor</th>
              <th>Cron</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules?.data.map(s => (
              <tr key={s.id}>
                <td>{s.processor}</td>
                <td><code>{s.cron}</code></td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <Button small minimal icon="edit" onClick={() => handleEdit(s)} />
                    <Button 
                        small 
                        minimal 
                        intent={Intent.DANGER} 
                        icon="trash" 
                        loading={deleteMutation.isLoading && deleteMutation.variables === s.id}
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the schedule for ${s.processor}?`)) {
                                deleteMutation.mutate(s.id);
                            }
                        }} 
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
};
