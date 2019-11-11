import React from 'react';
import { Modal, Grid, Button } from 'semantic-ui-react';

class InfoModal extends React.Component {
  render() {
    return (
      <Modal size="mini" open={this.props.open}>
        <Modal.Header>{this.props.messageType}</Modal.Header>
        <Modal.Content>{this.props.message}</Modal.Content>

        <Modal.Actions>
          <Grid>
            <Grid.Row centered>
              <Button color="blue" onClick={this.props.onClick}>
                Ok
              </Button>
            </Grid.Row>
          </Grid>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default InfoModal;
