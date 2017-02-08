import React from 'react';
import axios from 'axios';
import bluebird from 'bluebird';
import ItineraryList from './itineraryList.jsx';

export default class MyPlaces extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itineraries: {},
      currentItinerary: {
        name: '',
        places: []
      },
      saveMessage: ''
    };
  }

  render() {
    return (
      <div id="myPlacesContainer">
        <div id="myPlacesContent" className="clearfix">
          <div>
            <div id="itineraries">
              <div className="clearfix">
                <h3 className="itineraryHeader">Itineraries</h3>
              </div>
              <div id="myplace-itineraries">
                {Object.keys(this.state.itineraries).map((key) => (
                  <button onClick={this.setCurrent.bind(this)} name={key}>
                    {this.state.itineraries[key].name}
                  </button>
                ))}
              </div>
            </div>

          </div>
          <ItineraryList
            query={this.state.currentItinerary}
            list={this.state.currentItinerary.places}
            saveMessage={this.state.saveMessage}
            removeItem={this.removeItem.bind(this)}
            saveItinerary={this.saveItinerary.bind(this)}
          />
          <div id="map"></div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.getItineraries();
  }

  removeItem(key) {
    var places = this.state.currentItinerary.places;

    for (var i = 0; i < places.length; i++) {
      if (places[i].place_id === key) {
        places.splice(i, 1);
      }
    }

    this.setState({
      currentItinerary: this.state.currentItinerary,
      saveMessage: ''
    });
  }

  saveItinerary() {
    //TODO
    console.log('save clicked');

    console.log(this.state.currentItinerary.places);

                        //     saveItinerary() {
                        //   const context = this;
                        //   console.log(this.state.query, 'query');

                        //   axios.post('/itinerary', {
                        //     token: localStorage.token,
                        //     itineraryID: this.state.query.place_id,
                        //     itineraryName: this.state.query.name,
                        //     placeIDs: Object.keys(this.state.itinerary)
                        //   })
                        //   .then(function(res) {
                        //     if (res.status === 200) {
                        //       context.setState({
                        //         saveMessage: 'Saved'
                        //       });
                        //       console.log(context.state.saveMessage);
                        //     }
                        //   })
                        //   .catch(function(error) {
                        //     console.log(error, 'error saving itinerary');
                        //   });
                        // }
  }

  setCurrent(e) {
    const key = e.target.name;
    console.log('key is', key);

    this.setState({
      currentItinerary: this.state.itineraries[key]
    });
  }

  getItineraries() {
    const context = this;

    axios.get('/itinerary', {
      params: {
        token: localStorage.token
      }
    })
    .then(function(res) {
      console.log(res.data);
      context.buildItineraries(res.data);
    })
    .catch(function(error) {
      console.log(error, 'error retreiving itineraries');
    });
  }

  buildItineraries(data) {
    const itineraries = {};
    const context = this;

    this.buildMap(setItineraries);

    function setItineraries(service) {
      let first = true;

      data.forEach((itinerary) => {
        let placeID = itinerary.placeID;
        let key = itinerary.itineraryID;
        let name = itinerary.itineraryName;

        service.getDetails({
          placeId: placeID
        }, (place, status) => {
          if (itineraries[key] === undefined) {
            itineraries[key] = {};
            itineraries[key].name = name;
            itineraries[key].places = [];
          }
          itineraries[key].places.push(place);

          context.setState({
            itineraries: itineraries
          });

          if (first) {
            first = false;
            context.setState({
              currentItinerary: context.state.itineraries[Object.keys(context.state.itineraries)[0]]
            });

            console.log(context.state, 'state');
          }
        });
      });
    }
  }

  buildMap(callback) {
    const key = 'AIzaSyCBb0bm-_wNIf3oDMi-5PN_zeOf1bRWstI';
    const url = 'https://maps.googleapis.com/maps/api/js?key=' + key + '&libraries=places&callback=initMap';

    window.initMap = initMap;
    const ref = window.document.getElementsByTagName('script')[0];
    const script = window.document.createElement('script');
    script.src = url;
    ref.parentNode.insertBefore(script, ref);
    script.onload = function () {
      this.remove();
    };

    function initMap() {
      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.775, lng: -122.42 },
        zoom: 8,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      });

      const service = new google.maps.places.PlacesService(map);

      callback(service);
    }
  }
}
