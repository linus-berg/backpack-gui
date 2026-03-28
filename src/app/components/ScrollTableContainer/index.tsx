import styled from 'styled-components';

export const ScrollTableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--table-border);
  border-radius: 3px;

  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--table-header-bg);
    box-shadow: inset 0 -1px 0 var(--table-header-shadow);
  }
`;
