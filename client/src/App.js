// This is the code of the trial task client app

import React, { Component } from "react";
import axios from "axios";

const serverAddress = "http://localhost:3001/api"

class App extends Component {

  state = {
    data: [],
    intervalIsSet: false,
  };

  // Update the list of previous jobs every 1sec
  componentDidMount() {
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }

  // Kill the list updates when finished
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // Load data from DB to produce a list of previous jobs
  getDataFromDb = () => {
    fetch(serverAddress + "/getData")
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }));
  };

  // Remove a record from the list
  deleteFromDB = data_id => {
    axios.delete(serverAddress + "/deleteData", {
      data: {
        id: data_id
      }
    });
  };

  // Convert a file to audio and add to DB
  uploadAndConvertToAudio = () => {
    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);

    fetch(serverAddress + '/uploadAndConvertToAudio', {
      method: 'POST',
      body: data,
    });
  }

  // Convert a file to video and add to DB
  uploadAndConvertToVideo = () => {
    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);

    fetch(serverAddress + '/uploadAndConvertToVideo', {
      method: 'POST',
      body: data,
    });
  }

  // Join two audio files and add the resulting file to DB
  uploadAndConcatenateAudio = () => {
    const data = new FormData();
    data.append('fileA', this.uploadInputA.files[0]);
    data.append('fileB', this.uploadInputB.files[0]);

    fetch(serverAddress + '/uploadAndConcatenateAudio', {
      method: 'POST',
      body: data,
    });
  }

  // Open a file to allow for inspection and download
  openUrl = (urlAddress) => {
    window.open('http://localhost:3001' + urlAddress)
  };


  // Render a simple UI with inputs, buttons and a dynamic list
  render() {
    const { data } = this.state;
    return (
      <div>
        <input ref={(ref) => { this.uploadInput = ref; }} type="file" />
        <div>
          <button onClick={this.uploadAndConvertToAudio}>Convert To Audio</button>
          <button onClick={this.uploadAndConvertToVideo}>Convert To Video</button>
        </div>

        <br></br>
        <input ref={(ref) => { this.uploadInputA = ref; }} type="file" />
        <input ref={(ref) => { this.uploadInputB = ref; }} type="file" />
        <div>
          <button onClick={this.uploadAndConcatenateAudio}>Concatenate audio files</button>
        </div>

        <br></br>
        <div>
          <table>
            <tr>
              <th>Time</th>
              <th>Filename</th>
              <th></th>
              <th></th>
            </tr>

            {data.length <= 0
            ? "No previous files"
            : data.map(dat => (
                <tr>
                  <td>{dat.date}</td>
                  <td>{dat.filename}</td>
                  <td><button onClick={() => this.openUrl(dat.url)}>Download</button></td>
                  <td><button onClick={() => this.deleteFromDB(dat._id)}>Delete</button></td>
                </tr>
              ))}

          </table> 
        </div>
      </div>
    );
  }
}

export default App;
