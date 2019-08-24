<template>
  <div id="mapPanelContainer">
    <FilterPanel :gamesByCategory="gamesByCategory" @change="updateFilteredGames" @collapse="updateMapSize"/>
    <div id='map'>
    </div>
    <GameCenterPanel :gameCenter="selectedGameCenter" :gamesByCategory="gamesByCategory" :filteredGameIds="filteredGameIds" @close="selectedGameCenter = null"/>
  </div>
</template>

<script>
import axios from 'axios'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import Geolocation from 'ol/Geolocation.js'
import { fromLonLat } from 'ol/proj'
import { Point } from 'ol/geom'
import { Style, Circle as CircleStyle, Fill, Stroke, Icon } from 'ol/style'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { XYZ, Vector as VectorSource } from 'ol/source.js'
import { defaults as defaultControls, Control } from 'ol/control.js'
import Feature from 'ol/Feature'

import FilterPanel from './FilterPanel.vue'
import GameCenterPanel from './GameCenterPanel.vue'

const unwatchedStore = {
  map: null,
  source: null,
  features: [],
  markersLayer: null
}

export default {
  name: 'gameCenterMap',
  components: {
    FilterPanel,
    GameCenterPanel
  },
  props: ['gamesByCategory'],
  data () {
    return {
      selectedGameCenter: null,
      filteredGameIds: []
    }
  },
  methods: {
    /**
     * Create basic map
     * Called only once at setup
     */
    createMap () {
      const center = fromLonLat([135.4824549, 34.6826779])

      // Create custom control for geoloc
      const vueComponent = this
      class CenterViewControl extends Control {
        constructor (optOptions) {
          var options = optOptions || {}
          var button = document.createElement('button')
          button.innerHTML = '⌖'

          var element = document.createElement('div')
          element.className = 'center-map ol-unselectable ol-control'
          element.appendChild(button)

          super({
            element,
            target: options.target
          })

          button.addEventListener('click', vueComponent.centerMapToUserLocation, false)
        }
      }

      // Create actual map
      unwatchedStore.map = new Map({
        controls: defaultControls().extend([
          new CenterViewControl()
        ]),
        target: 'map',
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://cartodb-basemaps-{a-c}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
              attributions: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            })
          })
        ],
        view: new View({
          center,
          zoom: 12
        })
      })

      // Create empty vector source
      unwatchedStore.source = new VectorSource({})

      // Style for markers
      const getIconStyle = (feature) => {
        const gameCenter = feature.get('gameCenter')
        // game amount
        const gamesCount = gameCenter.gameIds.length
        let amount
        if (gamesCount <= 3) {
          amount = 'l'
        } else if (gamesCount > 15) {
          amount = 'h'
        } else {
          amount = 'm'
        }

        return new Style({
          image: new Icon({
            anchor: [0.5, 0.97],
            scale: this.selectedGameCenter === gameCenter ? 1.5 : 1,
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 0.90,
            src: `img/icon_${amount}.png`
          }),
          zIndex: this.selectedGameCenter === gameCenter ? 2 : undefined
        })
      }

      // Create layer to hold markers
      unwatchedStore.markersLayer = new VectorLayer({
        source: unwatchedStore.source,
        style: getIconStyle
      })
      unwatchedStore.map.addLayer(unwatchedStore.markersLayer)
    },
    /**
     * Configure geolocation
     * Called only once at setup
     */
    setupGeolocation () {
      unwatchedStore.geolocation = new Geolocation({
        trackingOptions: {
          enableHighAccuracy: true
        },
        tracking: true,
        projection: unwatchedStore.map.getView().getProjection()
      })
      const accuracyFeature = new Feature()
      unwatchedStore.geolocation.on('change:accuracyGeometry', () => {
        accuracyFeature.setGeometry(unwatchedStore.geolocation.getAccuracyGeometry())
      })

      const positionFeature = new Feature()
      positionFeature.setStyle(new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        })
      }))

      unwatchedStore.geolocation.on('change:position', () => {
        const coordinates = unwatchedStore.geolocation.getPosition()
        positionFeature.setGeometry(coordinates ? new Point(coordinates) : null)
      })

      const layer = new VectorLayer({
        source: new VectorSource({
          features: [accuracyFeature, positionFeature]
        })
      })
      unwatchedStore.map.addLayer(layer)
    },
    /**
     * Create features from gameCenters data
     * Called only once after getting gameCenter data
     */
    createFeatures (gameCenters) {
      // Create a feature for each game center
      unwatchedStore.features = gameCenters.map((gameCenter) =>
        new Feature({
          geometry: new Point(fromLonLat([gameCenter.longitude, gameCenter.latitude])),
          gameCenter
        })
      )
    },
    /**
     * Set which markers are displayed
     * Called every time filter criteria change
     */
    updateMarkers () {
      // Filter game centers
      let featuresFiltered
      if (this.filteredGameIds.length === 0) {
        // when no game selected display all
        featuresFiltered = unwatchedStore.features
      } else {
        featuresFiltered = unwatchedStore.features.filter(feature => this.filteredGameIds.filter(gameId => feature.get('gameCenter').gameIds.includes(gameId)).length > 0)
      }

      // clear existing markers
      unwatchedStore.source.clear()

      // Add features to source
      unwatchedStore.source.addFeatures(featuresFiltered)
    },
    /**
     * Configure click behaviour
     * Called only once at setup
     */
    setFeatureClickBehaviour () {
      // Set callback so that clicking a marker set it as selected
      unwatchedStore.map.on('click', (evt) => {
        const feature = unwatchedStore.map.forEachFeatureAtPixel(
          evt.pixel,
          (feature, layer) => feature,
          {
            layerFilter: layer => layer === unwatchedStore.markersLayer
          }
        )
        if (feature) {
          this.selectedGameCenter = feature.get('gameCenter')
          this.$emit('selectGameCenter', this.selectedGameCenter)
        }
      })

      // Set callback so that pointer icon is show when hovering marker
      unwatchedStore.map.on('pointermove', (e) => {
        if (e.dragging) return

        const pixel = unwatchedStore.map.getEventPixel(e.originalEvent)
        const hit = unwatchedStore.map.hasFeatureAtPixel(
          pixel,
          {
            layerFilter: layer => layer === unwatchedStore.markersLayer
          }
        )

        unwatchedStore.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
      })
    },
    updateFilteredGames (filteredGameIds) {
      this.filteredGameIds = filteredGameIds
    },
    updateMapSize () {
      // When a panel is opened/closed, thus modidifing the size of the map div,
      // Map size need to be updated
      // This is done after everything has been redrawn
      this.$nextTick(() => {
        unwatchedStore.map.updateSize()
      })
    },
    centerMapToUserLocation () {
      const coordinates = unwatchedStore.geolocation.getPosition()
      if (!coordinates) {
        return
      }
      unwatchedStore.map.getView().animate(
        {
          center: coordinates,
          zoom: 15
        }
      )
    }
  },
  watch: {
    filteredGameIds () {
      // Update markers if filter changed
      this.updateMarkers()
    },
    selectedGameCenter (newVal, oldVal) {
      // Update source to make selected icon bigger
      unwatchedStore.source.dispatchEvent('change')

      if (newVal == null || oldVal == null) {
        // If panel was opened or closed, update map size
        this.updateMapSize()
      }
    }
  },
  mounted () {
    // Create basic map
    this.createMap()

    // Request game centers list
    axios.get('data/game_centers.json')
      .then(response => {
        this.createFeatures(response.data)
        this.updateMarkers()
      })

    // Enable geolocation
    this.setupGeolocation()

    // Setup feature click behaviour
    this.setFeatureClickBehaviour()
  }
}

</script>

<style>
#mapPanelContainer {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#map {
  flex: 1;
  height: 100%;
}
/* Place zoom controls on the bottom right */
.ol-zoom {
  right: .5em;
  bottom: 3em;
  left: auto;
  top: auto;
}
.center-map {
  right: .5em;
  bottom: 7em;
}
</style>
