import React, { memo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Callout,
  Checkbox,
  Classes,
  Dialog,
  FormGroup,
  HTMLTable,
  InputGroup,
  Intent,
  Tag,
  Tooltip,
} from '@blueprintjs/core';
import { useBackpackApi } from 'api/backpack';
import { queryKeys } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { ApiKey } from 'types/ApiKey';
import { notify } from 'utils/toaster';
import { CopyButton } from 'app/components/common/CopyButton';
import { DateTime } from 'app/components/common/DateTime';
import { FillPage, PageHeader } from 'app/components/common/PageHeader';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { ScrollTableContainer } from 'app/components/ScrollTableContainer';

/** Create-key dialog. Once a key is shown it can't be dismissed by accident. */
const GenerateKeyDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [stored, setStored] = useState(false);

  const createMutation = useMutation({
    mutationFn: backpack.CreateApiKey,
    meta: { errorTitle: 'Could not generate the key' },
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys });
      setGeneratedKey(res.data.key || null);
    },
  });

  const reset = () => {
    setName('');
    setIsAdmin(false);
    setGeneratedKey(null);
    setStored(false);
  };
  const close = () => {
    if (generatedKey && !stored) {
      return;
    }
    reset();
    onClose();
  };

  const showingKey = generatedKey !== null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={close}
      title={showingKey ? 'Copy your new API key' : 'Generate API key'}
      icon="key"
      canOutsideClickClose={!showingKey}
      canEscapeKeyClose={!showingKey}
      isCloseButtonShown={!showingKey}
    >
      {showingKey ? (
        <>
          <div className={Classes.DIALOG_BODY}>
            <Callout
              intent={Intent.WARNING}
              icon="eye-off"
              title="This is the only time the key is shown"
            >
              Copy it now and store it somewhere safe, such as your CI secret
              store.
            </Callout>
            <FormGroup
              label="API key"
              labelFor="generated-key"
              style={{ marginTop: 15 }}
            >
              <InputGroup
                id="generated-key"
                readOnly
                value={generatedKey}
                onFocus={e => e.currentTarget.select()}
                style={{ fontFamily: 'monospace' }}
                rightElement={
                  <CopyButton
                    value={generatedKey}
                    label="API key"
                    onCopied={() =>
                      notify.success('API key copied to the clipboard.')
                    }
                  />
                }
              />
            </FormGroup>
            <Checkbox
              checked={stored}
              onChange={() => setStored(!stored)}
              label="I’ve copied and stored this key"
            />
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent={Intent.PRIMARY}
                disabled={!stored}
                onClick={close}
              >
                Done
              </Button>
            </div>
          </div>
        </>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault();
            if (name.trim()) {
              createMutation.mutate({ name: name.trim(), is_admin: isAdmin });
            }
          }}
        >
          <div className={Classes.DIALOG_BODY}>
            <FormGroup
              label="Key name"
              labelFor="key-name"
              labelInfo="(required)"
              helperText="Describe what will use the key, e.g. Jenkins build server."
            >
              <InputGroup
                id="key-name"
                placeholder="Enter key name…"
                value={name}
                autoFocus
                onChange={e => setName(e.currentTarget.value)}
              />
            </FormGroup>
            <Checkbox
              label="Administrator key"
              checked={isAdmin}
              onChange={() => setIsAdmin(!isAdmin)}
            />
            {isAdmin && (
              <Callout
                intent={Intent.DANGER}
                style={{ marginTop: '1rem' }}
                icon="warning-sign"
              >
                Administrator keys can call every endpoint, including deleting
                artifacts and changing processors.
              </Callout>
            )}
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button onClick={close}>Cancel</Button>
              <Button
                type="submit"
                intent={Intent.PRIMARY}
                loading={createMutation.isPending}
                disabled={!name.trim()}
              >
                Generate key
              </Button>
            </div>
          </div>
        </form>
      )}
    </Dialog>
  );
};

export const ApiKeyPage = memo(() => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.apiKeys,
    queryFn: () => backpack.GetApiKeys().then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: backpack.DeleteApiKey,
    meta: { errorTitle: 'Could not revoke the key' },
    onSuccess: () => {
      notify.success('API key revoked.');
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys });
    },
  });

  const revoke = async (key: ApiKey) => {
    const ok = await confirm({
      title: `Revoke “${key.name}”?`,
      message: (
        <p>
          Anything using this key (<code>{key.key_preview}</code>) stops working
          immediately. This can’t be undone.
        </p>
      ),
      confirmText: 'Revoke key',
      icon: 'trash',
      intent: Intent.DANGER,
    });
    if (ok) {
      deleteMutation.mutate(key.id);
    }
  };

  const keys = query.data ?? [];
  let body: React.JSX.Element;
  if (query.isLoading) {
    body = <LoadingState />;
  } else if (query.isError && !query.data) {
    body = (
      <QueryErrorState
        title="Couldn't load API keys"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  } else if (keys.length === 0) {
    body = (
      <EmptyState
        icon="key"
        title="No API keys"
        description="Generate a key to let scripts and CI jobs call the Backpack API."
      />
    );
  } else {
    body = (
      <ScrollTableContainer>
        <HTMLTable striped compact style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Scope</th>
              <th>Key</th>
              <th>Created by</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {keys.map(key => (
              <tr key={key.id}>
                <td style={{ fontWeight: 600 }}>{key.name}</td>
                <td>
                  <Tag
                    minimal
                    intent={key.is_admin ? Intent.DANGER : Intent.NONE}
                  >
                    {key.is_admin ? 'Administrator' : 'User'}
                  </Tag>
                </td>
                <td>
                  <code>{key.key_preview}</code>
                </td>
                <td>{key.created_by}</td>
                <td>
                  <DateTime value={key.created_at} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Tooltip content="Revoke key">
                    <Button
                      size="small"
                      variant="minimal"
                      intent={Intent.DANGER}
                      icon="trash"
                      aria-label={`Revoke ${key.name}`}
                      loading={
                        deleteMutation.isPending &&
                        deleteMutation.variables === key.id
                      }
                      onClick={() => revoke(key)}
                    />
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </ScrollTableContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>API keys</title>
      </Helmet>
      <FillPage>
        <PageHeader
          icon="key"
          title="API keys"
          description="Keys let scripts and CI jobs use the Backpack API without signing in."
          actions={
            <Button
              icon="plus"
              intent={Intent.PRIMARY}
              onClick={() => setIsDialogOpen(true)}
            >
              Generate key
            </Button>
          }
        />
        {body}
      </FillPage>
      <GenerateKeyDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
});
