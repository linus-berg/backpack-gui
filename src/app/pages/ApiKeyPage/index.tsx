import React, { memo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import {
  Spinner,
  HTMLTable,
  Button,
  Intent,
  Icon,
  H3,
  Dialog,
  Classes,
  FormGroup,
  InputGroup,
  Callout,
  Code,
  Tag,
  Checkbox,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { ScrollTableContainer } from 'app/components/ScrollTableContainer';

const PageDiv = styled.div`
  padding: 1rem;
`;

const Title = styled(H3)`
  display: flex;
  align-items: center;
  margin: 0;
`;

export const ApiKeyPage = memo(() => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery(['api_keys'], backpack.GetApiKeys);

  const createMutation = useMutation(backpack.CreateApiKey, {
    onSuccess: (res) => {
      queryClient.invalidateQueries(['api_keys']);
      setGeneratedKey((res.data as any).key);
      setNewKeyName('');
      setNewIsAdmin(false);
    },
  });

  const deleteMutation = useMutation(backpack.DeleteApiKey, {
    onSuccess: () => {
      queryClient.invalidateQueries(['api_keys']);
    },
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <Helmet>
        <title>API Keys</title>
      </Helmet>
      <PageDiv>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Title>
            <Icon icon="key" style={{ marginRight: '10px' }} />
            API Key Management
          </Title>
          <Button
            icon="plus"
            intent={Intent.PRIMARY}
            onClick={() => {
              setGeneratedKey(null);
              setIsDialogOpen(true);
            }}
          >
            Generate New Key
          </Button>
        </div>

        <ScrollTableContainer style={{ height: '70vh' }}>
          <HTMLTable striped condensed style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Scope</th>
                <th>Key Preview</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map(key => (
                <tr key={key.id}>
                  <td style={{ fontWeight: 'bold' }}>{key.name}</td>
                  <td>
                    <Tag minimal intent={key.is_admin ? Intent.DANGER : Intent.NONE}>
                      {key.is_admin ? 'Administrator' : 'User'}
                    </Tag>
                  </td>
                  <td>
                    <code>{key.key_preview}</code>
                  </td>
                  <td>{key.created_by}</td>
                  <td>{new Date(key.created_at).toLocaleString()}</td>
                  <td>
                    <Button
                      small
                      minimal
                      intent={Intent.DANGER}
                      icon="trash"
                      loading={deleteMutation.isLoading && deleteMutation.variables === key.id}
                      onClick={() => deleteMutation.mutate(key.id)}
                    />
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#abb3bf' }}>
                    No API keys found.
                  </td>
                </tr>
              )}
            </tbody>
          </HTMLTable>
        </ScrollTableContainer>

        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Generate API Key"
        >
          <div className={Classes.DIALOG_BODY}>
            {generatedKey ? (
              <Callout intent={Intent.SUCCESS} title="Key Generated Successfully" icon="tick">
                <p>Please copy this key now. You will not be able to see it again.</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                  <Code style={{ fontSize: '1.2em', flex: 1 }}>{generatedKey}</Code>
                  <Button 
                    icon="clipboard" 
                    onClick={() => navigator.clipboard.writeText(generatedKey)}
                  />
                </div>
              </Callout>
            ) : (
              <>
                <FormGroup
                  label="Key Name"
                  labelFor="key-name"
                  labelInfo="(required)"
                  helperText="Give this key a descriptive name (e.g. Jenkins Build Server)"
                >
                  <InputGroup
                    id="key-name"
                    placeholder="Enter key name..."
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                  />
                </FormGroup>
                <Checkbox
                  label="Administrator Key"
                  checked={newIsAdmin}
                  onChange={() => setNewIsAdmin(!newIsAdmin)}
                />
                {newIsAdmin && (
                  <Callout intent={Intent.DANGER} style={{ marginTop: '1rem' }} icon="warning-sign">
                    <div style={{ fontSize: '0.85em' }}>
                      Administrator keys have full access to all API endpoints, including deleting artifacts and managing processors.
                    </div>
                  </Callout>
                )}
              </>
            )}
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              {generatedKey ? (
                <Button intent={Intent.PRIMARY} onClick={() => setIsDialogOpen(false)}>Done</Button>
              ) : (
                <>
                  <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button
                    intent={Intent.PRIMARY}
                    onClick={() => createMutation.mutate({ name: newKeyName, is_admin: newIsAdmin })}
                    loading={createMutation.isLoading}
                    disabled={!newKeyName}
                  >
                    Generate
                  </Button>
                </>
              )}
            </div>
          </div>
        </Dialog>
      </PageDiv>
    </>
  );
});
