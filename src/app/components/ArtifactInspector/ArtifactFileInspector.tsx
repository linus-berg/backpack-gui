/**
 *
 * Files of one artifact version
 *
 */
import React, { memo, useRef } from 'react';
import { Classes, Dialog, HTMLTable } from '@blueprintjs/core';
import { ArtifactVersion } from 'types/ArtifactVersion';
import { CopyButton } from 'app/components/common/CopyButton';

interface Props {
  artifactId: string;
  processor: string;
  version?: ArtifactVersion | null;
  onClose: () => void;
}

export const ArtifactFileInspector = memo(
  ({ artifactId, processor, version, onClose }: Props) => {
    // Keep content while the dialog animates closed.
    const last = useRef<ArtifactVersion | null>(null);
    if (version) {
      last.current = version;
    }
    const shown = version ?? last.current;
    const files = Object.entries(shown?.files ?? {});

    return (
      <Dialog
        className="files-dialog"
        isOpen={!!version}
        onClose={onClose}
        icon="folder-open"
        title={shown ? `${artifactId} ${shown.version}` : ''}
      >
        <div className={Classes.DIALOG_BODY}>
          <HTMLTable className="files-table" condensed striped bordered>
            <thead>
              <tr>
                <th>Type</th>
                <th>Source URI</th>
                <th>Storage folder</th>
              </tr>
            </thead>
            <tbody>
              {files.map(([type, file]) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td style={{ overflowWrap: 'anywhere' }}>
                    <a href={file.uri} target="_blank" rel="noreferrer">
                      {file.uri}
                    </a>{' '}
                    <CopyButton value={file.uri} label="URI" />
                  </td>
                  <td>
                    {file.folder === '' ? (
                      <>
                        {processor}{' '}
                        <span className={Classes.TEXT_MUTED}>(default)</span>
                      </>
                    ) : (
                      file.folder
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        </div>
      </Dialog>
    );
  },
);
