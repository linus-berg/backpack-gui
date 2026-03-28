import styled from 'styled-components';

export const ScrollTableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid #394b59;
  border-radius: 3px;

  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #f5f8fa;
    box-shadow: inset 0 -1px 0 #d8e1e8;

    .bp4-dark & {
      background-color: #30404d;
      box-shadow: inset 0 -1px 0 #394b59;
    }
  }
`;
