<template>
  <div class="vdr" @mousedown.stop="elmDown" :style="style"
       :class="{ draggable: draggable, resizable: resizable, active: enabled, dragging: dragging, resizing: resizing }">
    <div
      class="handle"
      v-if="resizable"
      v-for="handle in handles"
      :class="'handle-' + handle"
      :style="{ display: enabled ? 'block' : 'none'}"
      @mousedown.stop.prevent="handleDown(handle, $event)"
    ></div>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    replace: true,
    name: 'as-dragger',
    props: {
      active: {
        type: Boolean, default: false
      },
      draggable: {
        type: Boolean, default: true
      },
      resizable: {
        type: Boolean, default: true
      },
      w: {
        type: Number,
        default: 200,
        validator(val) {
          return val > 0
        }
      },
      h: {
        type: Number,
        default: 200,
        validator(val) {
          return val > 0
        }
      },
      minw: {
        type: Number,
        default: 4,
        validator(val) {
          return val > 0
        }
      },
      minh: {
        type: Number,
        default: 4,
        validator(val) {
          return val > 0
        }
      },
      x: {
        type: Number,
        default: 0,
        validator(val) {
          return typeof val === 'number'
        }
      },
      y: {
        type: Number,
        default: 0,
        validator(val) {
          return typeof val === 'number'
        }
      },
      z: {
        type: [String, Number],
        default: 'auto',
        validator(val) {
//          const valid = (typeof val === 'string') ? val === 'auto' : val >= 0
          return (typeof val === 'string') ? val === 'auto' : val >= 0
        }
      },
//      handles: {
//        type: Array,
//        default() {
//          return ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml']
//        }
//      },
      axis: {
        type: String,
        default: 'both',
        validator(val) {
          return ['x', 'y', 'both'].indexOf(val) !== -1
        }
      },
      grid: {
        type: Array,
        default() {
          return [1, 1]
        }
      },
      parent: {
        type: Boolean, default: true
      },
      maximize: {
        type: Boolean, default: false
      },
      ratio: {
        type: Number, default: 0
      },
      zoom: {
        type: Number, default: 1
      }
    },
    created() {
      this.parentX = 0
      this.parentW = 9999
      this.parentY = 0
      this.parentH = 9999

      this.mouseX = 0
      this.mouseY = 0

      this.lastMouseX = 0
      this.lastMouseY = 0

      this.mouseOffX = 0
      this.mouseOffY = 0

      this.elmX = 0
      this.elmY = 0

      this.elmW = 0
      this.elmH = 0
    },
    mounted() {
      document.documentElement.addEventListener('mousemove', this.handleMove, true)
      document.documentElement.addEventListener('mousedown', this.deselect, true)
      document.documentElement.addEventListener('mouseup', this.handleUp, true)

      this.elmX = parseInt(this.$el.style.left)
      this.elmY = parseInt(this.$el.style.top)
      this.elmW = this.$el.offsetWidth || this.$el.clientWidth
      this.elmH = this.$el.offsetHeight || this.$el.clientHeight

      this.reviewDimensions()
    },
    beforeDestroy() {
      document.documentElement.removeEventListener('mousemove', this.handleMove, true)
      document.documentElement.removeEventListener('mousedown', this.deselect, true)
      document.documentElement.removeEventListener('mouseup', this.handleUp, true)
    },
    data() {
      return {
        top: this.y,
        left: this.x,
        width: this.w,
        height: this.h,
        resizing: false,
        dragging: false,
        enabled: this.active,
        handle: null,
        zIndex: this.z
      }
    },
    methods: {
      reviewDimensions() {
        if (this.minw > this.w) this.width = this.minw

        if (this.minh > this.h) this.height = this.minh

        if (this.parent) {
          const parentW = parseInt(this.$el.parentNode.clientWidth, 10)
          const parentH = parseInt(this.$el.parentNode.clientHeight, 10)

          this.parentW = parentW
          this.parentH = parentH

          if (this.w > this.parentW) this.width = parentW

          if (this.h > this.parentH) this.height = parentH

          if ((this.x + this.w) > this.parentW) this.width = parentW - this.x

          if ((this.y + this.h) > this.parentH) this.height = parentH - this.y

          this.elmW = this.width
          this.elmH = this.height
        }

//        this.$emit('resizing', this.left, this.top, this.width, this.height)
        this.$emit('init', this.$el.id, this.left, this.top, this.width, this.height)
      },
      elmDown(e) {
        const target = e.target || e.srcElement

        if (this.$el.contains(target)) {
//          this.reviewDimensions()

          if (!this.enabled) {
            this.enabled = true

            this.$emit('activated')
            this.$emit('update:active', true)
          }

          if (this.draggable) {
            this.dragging = true
          }
        }
      },
      deselect(e) {
        this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
        this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop

        this.lastMouseX = this.mouseX
        this.lastMouseY = this.mouseY
//
//        const target = e.target || e.srcElement
//        const regex = new RegExp('handle-([trmbl]{2})', '')
//
//        if (!this.$el.contains(target) && !regex.test(target.className)) {
//          if (this.enabled) {
//            this.enabled = false
//
//            this.$emit('deactivated')
//            this.$emit('update:active', false)
//          }
//        }
      },
      handleDown(handle, e) {
        this.handle = handle

        if (e.stopPropagation) e.stopPropagation()
        if (e.preventDefault) e.preventDefault()

        this.resizing = true
      },
      handleMove(e) {
        this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
        this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop

        let diffX = Math.round((this.mouseX - this.lastMouseX + this.mouseOffX) / this.zoom)
        let diffY = Math.round((this.mouseY - this.lastMouseY + this.mouseOffY) / this.zoom)

        this.mouseOffX = this.mouseOffY = 0

        this.lastMouseX = this.mouseX
        this.lastMouseY = this.mouseY

        const dX = diffX
        const dY = diffY

        if (this.resizing) {
          if (this.handle.indexOf('t') >= 0) {
            if (this.elmH - dY < this.minh) this.mouseOffY = (dY - (diffY = this.elmH - this.minh))
            else if (this.elmY + dY < this.parentY) this.mouseOffY = (dY - (diffY = this.parentY - this.elmY))
            this.elmY += diffY
            this.elmH -= diffY

//            this.elmW = this.elmH / this.ratio
          }

          if (this.handle.indexOf('b') >= 0) {
            if (this.elmH + dY < this.minh) this.mouseOffY = (dY - (diffY = this.minh - this.elmH))
            else if (this.elmY + this.elmH + dY > this.parentH) this.mouseOffY = (dY - (diffY = this.parentH - this.elmY - this.elmH))
            this.elmH += diffY
//            this.elmW = this.elmH / this.ratio
          }

          if (this.handle.indexOf('l') >= 0) {
            if (this.elmW - dX < this.minw) this.mouseOffX = (dX - (diffX = this.elmW - this.minw))
            else if (this.elmX + dX < this.parentX) this.mouseOffX = (dX - (diffX = this.parentX - this.elmX))
            this.elmX += diffX
            this.elmW -= diffX

//            this.elmH = (this.elmW + diffX) * this.ratio
          }

          if (this.handle.indexOf('r') >= 0) {
            if (this.elmW + dX < this.minw) this.mouseOffX = (dX - (diffX = this.minw - this.elmW))
            else if (this.elmX + this.elmW + dX > this.parentW) this.mouseOffX = (dX - (diffX = this.parentW - this.elmX - this.elmW))
            this.elmW += diffX
//            this.elmH = (this.elmW + diffX) * this.ratio
          }

          this.left = (Math.round(this.elmX / this.grid[0]) * this.grid[0])
          this.top = (Math.round(this.elmY / this.grid[1]) * this.grid[1])

          this.width = (Math.round(this.elmW / this.grid[0]) * this.grid[0])
          if (this.ratio > 0) {
            this.height = (Math.round(this.elmW * this.ratio / this.grid[1]) * this.grid[1])
          } else {
            this.height = (Math.round(this.elmH / this.grid[1]) * this.grid[1])
          }

//          this.$emit('resizing', this.left, this.top, this.width, this.height)
        } else if (this.dragging) {
          if (this.parent) {
            if (this.elmX + dX < this.parentX) this.mouseOffX = (dX - (diffX = this.parentX - this.elmX))
            else if (this.elmX + this.elmW + dX > this.parentW) this.mouseOffX = (dX - (diffX = this.parentW - this.elmX - this.elmW))

            if (this.elmY + dY < this.parentY) this.mouseOffY = (dY - (diffY = this.parentY - this.elmY))
            else if (this.elmY + this.elmH + dY > this.parentH) this.mouseOffY = (dY - (diffY = this.parentH - this.elmY - this.elmH))
          }

          this.elmX += diffX
          this.elmY += diffY

          this.left = this.elmX
          this.top = this.elmY

//          if (this.axis === 'x' || this.axis === 'both') {
//            this.left = (Math.round(this.elmX / this.grid[0]) * this.grid[0])
//          }
//          if (this.axis === 'y' || this.axis === 'both') {
//            this.top = (Math.round(this.elmY / this.grid[1]) * this.grid[1])
//          }

//          this.$emit('dragging', this.left, this.top)
        }
      },
      handleUp(e) {
        this.handle = null
        if (this.resizing) {
          this.resizing = false
//          this.$emit('resizestop', this.left, this.top, this.width, this.height)
          this.$emit('resizestop', this.$el.id, this.left, this.top, this.width, this.height)
        }
        if (this.dragging) {
          this.dragging = false
//          this.$emit('dragstop', this.left, this.top)
          this.$emit('dragstop', this.$el.id, this.left, this.top, this.width, this.height)
        }

        this.elmX = this.left
        this.elmY = this.top
      }
    },
    computed: {
      style() {
        return {
          top: this.top + 'px',
          left: this.left + 'px',
          width: this.width + 'px',
          height: this.height + 'px',
          zIndex: this.zIndex
        }
      },
      handles() {
        if (this.ratio > 0) {
          return ['br']
        } else {
          return ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml']
        }
      }
    },
    watch: {
      active(val) {
        this.enabled = val
      },
      z(val) {
        if (val >= 0 || val === 'auto') {
          this.zIndex = val
        }
      },
      x() {
        this.left = this.x
        this.elmX = this.x
      },
      y() {
        this.top = this.y
        this.elmY = this.y
      },
      w() {
        this.width = this.w
        this.elmW = this.w
      },
      h() {
        this.height = this.h
        this.elmH = this.h
      }
    }
  }
</script>

<style scoped>
  .vdr {
    position: absolute;
    box-sizing: border-box;
  }

  .draggable:hover.active {
    cursor: move;
  }

  .handle {
    box-sizing: border-box;
    display: none;
    position: absolute;
    width: 10px;
    height: 10px;
    font-size: 1px;
    background: #66b1ff;
    border: 1px solid #f5f7fa;
    box-shadow: 0px 0px 2px #666;
    z-index: 999;
  }

  .handle-tl {
    top: -10px;
    left: -10px;
    cursor: nw-resize;
  }

  .handle-tm {
    top: -10px;
    left: 50%;
    margin-left: -5px;
    cursor: n-resize;
  }

  .handle-tr {
    top: -10px;
    right: -10px;
    cursor: ne-resize;
  }

  .handle-ml {
    top: 50%;
    margin-top: -5px;
    left: -10px;
    cursor: w-resize;
  }

  .handle-mr {
    top: 50%;
    margin-top: -5px;
    right: -10px;
    cursor: e-resize;
  }

  .handle-bl {
    bottom: -10px;
    left: -10px;
    cursor: sw-resize;
  }

  .handle-bm {
    bottom: -10px;
    left: 50%;
    margin-left: -5px;
    cursor: s-resize;
  }

  .handle-br {
    bottom: -10px;
    right: -10px;
    cursor: se-resize;
  }
</style>
