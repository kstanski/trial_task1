
// /client/App.js
import React, { Component } from "react";
import axios from "axios";

class App extends Component {
  // initialize our state 

  state = {
    data: [],
    intervalIsSet: false,
  };

  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has 
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }

  // never let a process live forever 
  // always kill a process everytime we are done using it
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // just a note, here, in the front end, we use the id key of our data object 
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify 
  // data base entries

  // our first get method that uses our backend api to 
  // fetch data from our data base
  getDataFromDb = () => {
    fetch("http://localhost:3001/api/getData")
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }));
  };


  // our delete method that uses our backend api 
  // to remove existing database information
  deleteFromDB = data_id => {
    axios.delete("http://localhost:3001/api/deleteData", {
      data: {
        id: data_id
      }
    });
  };

  uploadAndConvertToAudio = (ev) => {
    ev.preventDefault();

    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);

    fetch('http://localhost:3001/api/uploadAndConvertToAudio', {
      method: 'POST',
      body: data,
    });
  }

  uploadAndConvertToVideo = (ev) => {
    ev.preventDefault();

    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);

    fetch('http://localhost:3001/api/uploadAndConvertToVideo', {
      method: 'POST',
      body: data,
    });
  }

  uploadAndConcatenateAudio = (ev) => {
    ev.preventDefault();

    const data = new FormData();
    data.append('fileA', this.uploadInputA.files[0]);
    data.append('fileB', this.uploadInputB.files[0]);

    fetch('http://localhost:3001/api/uploadAndConcatenateAudio', {
      method: 'POST',
      body: data,
    });
  }

  openUrl = (urlAddress) => {
    window.open('http://localhost:3001' + urlAddress)
  };


  // here is our UI
  // it is easy to understand their functions when you 
  // see them render into our screen
  render() {
    const { data } = this.state;
    return (
      <div>
        <input ref={(ref) => { this.uploadInput = ref; }} type="file" />
        <div>
          <button onClick={this.uploadAndConvertToAudio}>Convert To Audio</button>
        </div>
        <div>
          <button onClick={this.uploadAndConvertToVideo}>Convert To Video</button>
        </div>
        <input ref={(ref) => { this.uploadInputA = ref; }} type="file" />
        <input ref={(ref) => { this.uploadInputB = ref; }} type="file" />
        <div>
          <button onClick={this.uploadAndConcatenateAudio}>Concatenate audio files</button>
        </div>

        <div>
          <table>
            <tr>
              <th>Date</th>
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
