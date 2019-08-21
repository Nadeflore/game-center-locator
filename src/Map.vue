<template>
  <div id='map'>
  </div>
</template>

<script>
import axios from 'axios'
import 'ol/ol.css'
import { fromLonLat } from 'ol/proj'
import { Point } from 'ol/geom'
import { Style, Icon } from 'ol/style'
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { XYZ, Vector as VectorSource } from 'ol/source.js'
import Feature from 'ol/Feature'

const unwatchedStore = {
  map: null,
  source: null,
  features: []
}

export default {
  name: 'gameCenterMap',
  components: {
  },
  props: ['gamesByCategory', 'filteredGameIds', 'panelCollapsed'],
  data () {
    return {
      selectedGameCenter: null,
    }
  },
  methods: {
    createMap () {
      const center = fromLonLat([135.4824549, 34.6826779])
      unwatchedStore.map = new Map({
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
        // game amount
        const gamesCount = feature.get('gameCenter').gameIds.length
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
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 0.80,
            src: `img/icon_${amount}.png`
          })
        })
      }

      // Create vector layer
      const layer = new VectorLayer({
        source: unwatchedStore.source,
        style: getIconStyle
      })
      unwatchedStore.map.addLayer(layer)
    },
    createFeatures (gameCenters) {
      // Create a feature for each game center
      unwatchedStore.features = gameCenters.map((gameCenter) =>
        new Feature({
          geometry: new Point(fromLonLat([gameCenter.longitude, gameCenter.latitude])),
          gameCenter
        })
      )
    },
    updateMarkers () {
      // Filter game centers
      const featuresFiltered = unwatchedStore.features.filter(feature => this.filteredGameIds.filter(gameId => feature.get('gameCenter').gameIds.includes(gameId)).length > 0)

      // clear existing markers
      unwatchedStore.source.clear()

      // Add features to source
      unwatchedStore.source.addFeatures(featuresFiltered)
    },
    setFeatureClickBehaviour () {
      // Set callback so that clicking a feature set it as selected
      unwatchedStore.map.on('click', (evt) => {
        const feature = unwatchedStore.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => feature)
        if (feature) {
          this.selectedGameCenter = feature.get('gameCenter')
          this.$emit('selectGameCenter', this.selectedGameCenter)
        }
      })

      // Set callback so that pointer icon is show when hovering marker
      unwatchedStore.map.on('pointermove', (e) => {
        if (e.dragging) return

        const pixel = unwatchedStore.map.getEventPixel(e.originalEvent)
        const hit = unwatchedStore.map.hasFeatureAtPixel(pixel)

        unwatchedStore.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
      })
    }
  },
  watch: {
    filteredGameIds (val) {
      // Update markers if filter changed
      this.updateMarkers()
    },
    panelCollapsed (val) {
      // Update map size if panel collapse size change
      unwatchedStore.map.updateSize()
    }
  },
  mounted () {
    // Create basic map
    this.createMap()

    // Request game centers list
    axios.get('data/game_centers.json')
      .then(response => {
        this.createFeatures(response.data)
      })

    // Setup feature click behaviour
    this.setFeatureClickBehaviour()
  }
}

</script>

<style>
#map {
    height: 100%;
}
.ol-zoom {
  right: .5em;
  left: auto;
}
</style>
