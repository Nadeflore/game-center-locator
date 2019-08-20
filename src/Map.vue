<template>
  <div id='map'>
    <GameCenterPopup :gameCenter="selectedGameCenter" :gamesByCategory="gamesByCategory" v-on:close="closePopup" ref="popup"/>
  </div>
</template>

<script>
import 'ol/ol.css'
import { fromLonLat } from 'ol/proj'
import { Point } from 'ol/geom'
import { Style, Icon } from 'ol/style'
import Map from 'ol/Map'
import View from 'ol/View'
import Overlay from 'ol/Overlay'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { XYZ, Vector as VectorSource } from 'ol/source.js'
import Feature from 'ol/Feature'
import GameCenterPopup from './GameCenterPopup.vue'

export default {
  name: 'gameCenterMap',
  components: {
    GameCenterPopup
  },
  props: ['gamesByCategory', 'gameCenters', 'filteredGameIds'],
  data () {
    return {
      map: null,
      source: null,
      selectedGameCenter: null
    }
  },
  methods: {
    createMap () {
      const center = fromLonLat([135.4824549, 34.6826779])
      this.map = new Map({
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
      this.source = new VectorSource({})

      // Style for markers
      const getIconStyle = (feature) => {
        // game amount
        const gamesCount = feature.get("gameCenter").gameIds.length
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
        source: this.source,
        style: getIconStyle
      })
      this.map.addLayer(layer)
    },
    setMarkers () {
      // Filter game centers
      const gameCentersFiltered = this.gameCenters.filter(gameCenter => this.filteredGameIds.filter(gameId => gameCenter.gameIds.includes(gameId)).length > 0)
        
      // clear existing markers
      this.source.clear()
      // Create a feature for each game center
      const features = gameCentersFiltered.map((gameCenter) =>
        new Feature({
          geometry: new Point(fromLonLat([gameCenter.longitude, gameCenter.latitude])),
          gameCenter
        })
      )

      // Add features to source
      this.source.addFeatures(features)
    },
    setPopup () {
      this.popupOverlay = new Overlay({
        element: this.$refs['popup'].$el,
        autoPan: true,
        offset: [0, -50]
      })
      this.map.addOverlay(this.popupOverlay)

      // Set callback so that clicking a feature opens popup
      this.map.on('click', (evt) => {
        const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => feature)
        if (feature) {
          const geometry = feature.getGeometry()
          const coord = geometry.getCoordinates()

          this.selectedGameCenter = feature.get('gameCenter')
          this.popupOverlay.setPosition(coord)
        }
      })

      // Set callback so that pointer icon is show when hovering marker
      this.map.on('pointermove', (e) => {
        if (e.dragging) return

        const pixel = this.map.getEventPixel(e.originalEvent)
        const hit = this.map.hasFeatureAtPixel(pixel)

        this.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
      })
    },
    closePopup () {
      this.popupOverlay.setPosition(undefined)
    }
  },
  watch: {
    gameCenters (val) {
      // Set markers again if game centers list changed
      this.setMarkers()
    },
    filteredGameIds (val) {
      // Set markers again if filter changed
      this.setMarkers()
    }
  },
  mounted () {
    // Create basic map
    this.createMap()

    // Add markers
    this.setMarkers()

    // Setup popup
    this.setPopup()
  }
}

</script>

<style scoped>
#map {
    height: 100%;
}
</style>
