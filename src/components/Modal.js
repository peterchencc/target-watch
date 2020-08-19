import React, { Component } from 'react'

export default class Modal extends Component {
  onClose = (e) => {
    this.props.onClose && this.props.onClose(e)
  }
  render() {
    if (!this.props.show) {
      return null
    }
    return (
      <div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>

        <div class="modal-container bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto">
          <div class="modal-content py-4 text-left px-6">
            <div class="flex justify-between items-center pb-3">
              <p class="text-2xl font-bold">{this.props.title}</p>
              <div
                class="modal-close cursor-pointer z-50"
                onClick={this.onClose}
              >
                <svg
                  class="fill-current text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                >
                  <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                </svg>
              </div>
            </div>

            <div class="content">{this.props.children}</div>

            <div class="flex justify-end pt-2">
              <button class="px-4 bg-transparent p-3 rounded-lg text-indigo-500 hover:bg-gray-100 hover:text-indigo-400 mr-2">
                Action
              </button>
              <button
                onClick={this.onClose}
                class="modal-close px-4 bg-indigo-500 p-3 rounded-lg text-white hover:bg-indigo-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
