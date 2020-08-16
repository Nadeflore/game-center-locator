<template>
  <div id="mapPanelContainer">
    <MessageBar v-if="statusMessage" :error="networkError">{{statusMessage}}</MessageBar>
    <FilterPanel :gamesByCategory="gamesByCategory" :defaultSelectedGameIds="filteredGameIds" :defaultGameAmountFilter="gameAmountFilter"  @change="updateFilteredGames"/>
    <div id='map' :class="{'right-panel-open': selectedGameCenter}">
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
import { fromLonLat, toLonLat } from 'ol/proj'
import { Point } from 'ol/geom'
import { Style, Circle as CircleStyle, Fill, Stroke, Icon } from 'ol/style'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { XYZ, Vector as VectorSource } from 'ol/source.js'
import { defaults as defaultControls, Control } from 'ol/control.js'
import Feature from 'ol/Feature'

import FilterPanel from './FilterPanel.vue'
import GameCenterPanel from './GameCenterPanel.vue'
import MessageBar from './components/MessageBar.vue'

const unwatchedStore = {
  gameCenters: [],
  map: null,
  source: null,
  features: [],
  markersLayer: null
}

export default {
  name: 'gameCenterMap',
  components: {
    FilterPanel,
    GameCenterPanel,
    MessageBar
  },
  data () {
    return {
      gamesByCategory: [],
      gamesListLoaded: false,
      gameCentersLoaded: false,
      networkError: false
    }
  },
  computed: {
    statusMessage () {
      if (this.networkError) {
        return 'Error occured during resources loading.'
      }

      if (!this.gamesListLoaded || !this.gameCentersLoaded) {
        return 'Loading...'
      }

      return null
    },
    selectedGameCenter: {
      get () {
        if (this.gameCentersLoaded === null) {
          return null
        }
        const selectedGameCenterName = this.$route.query.selected
        const found = unwatchedStore.gameCenters.find(e => e.name === selectedGameCenterName)
        if (!found) {
          return null
        }

        return found
      },
      set (value) {
        if (value) {
          if (value.name !== this.$route.query.selected) {
            this.$router.replace({ query: { ...this.$route.query, selected: value.name } })
          }
        } else {
          const { selected, ...newQuery } = this.$route.query
          this.$router.replace({ query: newQuery })
        }
      }
    },
    gameAmountFilter: {
      get () {
        const gameAmountFilter = this.$route.query.filterAmount
        if (!gameAmountFilter) {
          return 1
        }

        return gameAmountFilter
      },
      set (gameAmountFilter) {
        if (gameAmountFilter !== 1) {
          if (gameAmountFilter !== +this.$route.query.filterAmount) {
            this.$router.replace({ query: { ...this.$route.query, filterAmount: gameAmountFilter } })
          }
        } else if (this.$route.query.filterAmount) {
          const { filterAmount, ...newQuery } = this.$route.query
          this.$router.replace({ query: newQuery })
        }
      }
    },
    filteredGameIds: {
      get () {
        const filteredGameIdsString = this.$route.query.filter
        if (!filteredGameIdsString) {
          return []
        }

        return filteredGameIdsString.split(',')
      },
      set (filteredGameIds) {
        if (filteredGameIds && filteredGameIds.length > 0) {
          const filteredGameIdsString = filteredGameIds.join(',')
          if (filteredGameIdsString !== this.$route.query.filter) {
            this.$router.replace({ query: { ...this.$route.query, filter: filteredGameIdsString } })
          }
        } else if (this.$route.query.filter) {
          const { filter, ...newQuery } = this.$route.query
          this.$router.replace({ query: newQuery })
        }
      }
    }
  },
  methods: {
    /**
     * Create basic map
     * Called only once at setup
     */
    createMap () {
      // Default view coordinates
      let center = fromLonLat([135.4824549, 34.6826779])
      let zoom = 12

      // Extract view from url
      if (this.$route.params.view) {
        const match = /@(\d+(?:\.\d+)?),(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)z/.exec(this.$route.params.view)
        if (match) {
          center = fromLonLat([+match[2], +match[1]])
          zoom = +match[3]
        }
      }

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
              // url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
              attributions: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            })
          })
        ],
        view: new View({
          center,
          zoom
        })
      })

      // Create empty vector source
      unwatchedStore.source = new VectorSource({})

      // Style for markers
      const getIconStyle = (feature) => {
        const gameCenter = feature.get('gameCenter')
        // game amount
        const gamesCount = Object.keys(gameCenter.games).length
        let amount
        if (gamesCount <= 3) {
          amount = 'l'
        } else if (gamesCount > 15) {
          amount = 'h'
        } else {
          amount = 'm'
        }

        // logo
        const logo = gameCenter.logo || 'game'

        return new Style({
          image: new Icon({
            anchor: [0.5, 0.97],
            scale: this.selectedGameCenter === gameCenter ? 1 : 0.7,
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 0.90,
            src: `/img/marker_${logo}_${amount}.png`
          }),
          zIndex: this.selectedGameCenter === gameCenter ? 2 : undefined
        })
      }

      // Create layer to hold markers
      unwatchedStore.markersLayer = new VectorLayer({
        source: unwatchedStore.source,
        style: getIconStyle,
        zIndex: 1
      })
      unwatchedStore.map.addLayer(unwatchedStore.markersLayer)

      // Add listener to view move event
      unwatchedStore.map.on('moveend', () => {
        const view = unwatchedStore.map.getView()
        const coordinates = toLonLat(view.getCenter())
        const zoom = view.getZoom()
        const viewString = `@${coordinates[1]},${coordinates[0]},${zoom}z`
        if (this.$route.params.view !== viewString) {
          this.$router.replace({ name: 'map', params: { view: viewString }, query: this.$route.query })
        }
      })
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

      const positionLayer = new VectorLayer({
        source: new VectorSource({
          features: [positionFeature]
        }),
        zIndex: 3
      })
      const accuracyLayer = new VectorLayer({
        source: new VectorSource({
          features: [accuracyFeature]
        }),
        zIndex: 0
      })
      unwatchedStore.map.addLayer(accuracyLayer)
      unwatchedStore.map.addLayer(positionLayer)
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
      const featuresFiltered = unwatchedStore.features.filter(feature => {
        const gameCenter = feature.get('gameCenter')
        if (this.filteredGameIds.length > 0) {
          const gameCenterGames = []
          for (const [gameId, game] of Object.entries(gameCenter.games)) {
            gameCenterGames.push(gameId)
            if (game.cabs) {
              for (const cabId of Object.keys(game.cabs)) {
                gameCenterGames.push(`${gameId}[${cabId}]`)
              }
            }
          }

          // Only keep game centers with a least `gameAmountFilter` of the selected games
          return this.filteredGameIds.filter(gameId => gameCenterGames.includes(gameId)).length >= this.gameAmountFilter
        } else {
          // Only keep game centers with at least `gameAmountFilter` of games
          return Object.keys(gameCenter.games).length >= this.gameAmountFilter
        }
      })

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
    updateFilteredGames (filteredGameIds, gameAmountFilter) {
      this.filteredGameIds = filteredGameIds
      this.gameAmountFilter = gameAmountFilter
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
    gameAmountFilter () {
      // Update markers if filter amount ratio changed
      this.updateMarkers()
    },
    selectedGameCenter (newVal, oldVal) {
      // Update source to make selected icon bigger
      unwatchedStore.source.dispatchEvent('change')
    }
  },
  mounted () {
    // Request games list
    axios.get('/data/games_by_category.json')
      .then(response => {
        // Add computed game ids list with cab type
        const categories = response.data
        for (const category of categories) {
          const categoryGameIds = []
          for (const game of category.games) {
            categoryGameIds.push(game.id)
            if (game.cabs) {
              for (const cabId of Object.keys(game.cabs)) {
                categoryGameIds.push(`${game.id}[${cabId}]`)
              }
            }
          }
          category.gameIds = categoryGameIds
        }

        this.gamesByCategory = categories
        this.gamesListLoaded = true
      })
      .catch(error => {
        this.networkError = error
      })

    // Create basic map
    this.createMap()

    // Request game centers list
    axios.get('/data/game_centers_compact.json')
      .then(response => {
        unwatchedStore.gameCenters = response.data
        this.gameCentersLoaded = true
        this.createFeatures(unwatchedStore.gameCenters)
        this.updateMarkers()
      })
      .catch(error => {
        this.networkError = error
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
.ol-touch .ol-zoom {
  bottom: 4em;
}
.ol-touch .center-map {
  bottom: 9em;
}
.right-panel-open .ol-control {
  right: 20.5em;
}
</style>
