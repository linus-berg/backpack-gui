/**
 *
 * Artifact field
 *
 */
import React, { memo } from 'react';
import _ from 'lodash';
import { Classes, Dialog, HTMLTable } from '@blueprintjs/core';
import { ArtifactVersion } from 'types/ArtifactVersion';
import { ArtifactFile } from 'types/ArtifactFile';

interface Props {
  version?: ArtifactVersion | null;
  onClose: () => void;
}

export const ArtifactFileInspector = memo((props: Props) => {
  const version = props.version;
  const files = version?.files;
  const MapRow = (file: ArtifactFile, key: string) => {
    return (
      <tr>
        <td>{key}</td>
        <td>
          <a href={file.uri} target="_blank" rel="noreferrer">
            {file.uri}
          </a>
        </td>
        <td>{file.folder === '' ? 'DEFUALT' : file.folder}</td>
      </tr>
    );
  };
  return (
    <Dialog
      className="files-dialog"
      isOpen={version !== null}
      onClose={props.onClose}
      title={version?.version}
    >
      <div className={Classes.DIALOG_BODY}>
        <HTMLTable
          className="files-table"
          condensed
          striped
          bordered
          interactive
        >
          <thead>
            <tr>
              <th>Type</th>
              <th>URI</th>
              <th>Folder</th>
            </tr>
          </thead>
          <tbody>{_.map(files, MapRow)}</tbody>
        </HTMLTable>
      </div>
    </Dialog>
  );
});
