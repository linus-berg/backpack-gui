/**
 *
 * Artifact browser: one panel per processor.
 *
 */
import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useParams } from 'react-router-dom';
import { useProcessors, useRootArtifactCounts } from 'api/queries';
import { useUser } from 'app/context/UserContext';
import {
  FillPage,
  SplitContent,
  SplitLayout,
} from 'app/components/common/PageHeader';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { LinkButton } from 'app/components/common/LinkButton';
import { ProcessorSidebar } from 'app/components/ProcessorSidebar';
import { ProcessorPanel } from './ProcessorPanel';

export const ProcessorBrowser = memo(() => {
  const processors = useProcessors();
  const counts = useRootArtifactCounts(processors.data);
  const { processor: selectedId } = useParams();
  const { hasRole } = useUser();

  if (processors.isLoading) {
    return <LoadingState label="Loading processors…" />;
  }
  if (processors.isError) {
    return (
      <QueryErrorState
        title="Couldn't load processors"
        error={processors.error}
        onRetry={() => processors.refetch()}
      />
    );
  }

  const list = processors.data ?? [];
  if (list.length === 0) {
    return (
      <EmptyState
        icon="cube"
        title="No processors configured"
        description={
          hasRole('Administrator')
            ? 'Add a processor to start mirroring artifacts.'
            : 'Ask an administrator to configure a processor.'
        }
        action={
          hasRole('Administrator') ? (
            <LinkButton
              to="/config"
              icon="cog"
              text="Processor configuration"
            />
          ) : undefined
        }
      />
    );
  }

  if (!selectedId) {
    return (
      <Navigate to={`/processor/${encodeURIComponent(list[0].id)}`} replace />
    );
  }

  const selected = list.find(p => p.id === selectedId);

  return (
    <>
      <Helmet>
        <title>{selected ? `${selected.id} artifacts` : 'Artifacts'}</title>
        <meta name="description" content="Browse and add mirrored artifacts" />
      </Helmet>
      <FillPage>
        <SplitLayout>
          <ProcessorSidebar
            processors={list}
            basePath="/processor"
            counts={counts}
            label="Processors"
          />
          <SplitContent>
            {selected ? (
              <ProcessorPanel key={selected.id} processor={selected} />
            ) : (
              <EmptyState
                icon="search"
                title="Unknown processor"
                description={`There's no processor called “${selectedId}”. It may have been removed.`}
                action={
                  <LinkButton
                    to={`/processor/${encodeURIComponent(list[0].id)}`}
                    text={`Go to ${list[0].id}`}
                  />
                }
              />
            )}
          </SplitContent>
        </SplitLayout>
      </FillPage>
    </>
  );
});
