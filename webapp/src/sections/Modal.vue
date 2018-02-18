<template>
  <div class="modal fade" :id="modalId" tabindex="-1" role="dialog" :aria-labelledby="modalId + 'Label'" aria-hidden="true">
    <div class="modal-dialog lb-modal" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <slot name="header"></slot>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// TODO: Improve implementation to provide:
//        1. onShow / onHide events support (show.bs.modal, shown.bs.modal)
//          1.1. Use this.$emit to emit custom events to be processed by parents
//        2. custom open / close functions
export default {
  name: 'Modal',
  props: ['modalId']
}
</script>

<style scoped>
.lb-modal {
  min-width: 80%;
}
</style>
