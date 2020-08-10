import React, { Component } from 'react'

class Symbol extends Component {
  componentDidMount() {
    console.log('componentDidMount')
  }

  render() {
    console.log('render symbol')

    const {
      name,
      currentPrice,
      latestTargetDate,
      lowestTarget,
      highestTarget,
      targetsDuration,
      recentTargets,
    } = this.props.details

    return (
      <li>
        <h3 className="symbol-name">
          {name}
          <span className="price">
            {currentPrice ? currentPrice : 'no price'}
          </span>
        </h3>

        <div>latestTargetDate: {latestTargetDate}</div>
        <div>lowestTarget: {lowestTarget}</div>
        <div>highestTarget: {highestTarget}</div>
        {recentTargets && recentTargets.length > 0 && (
          <div>
            BASED ON {recentTargets.length} RATINGS IN Past{' '}
            {targetsDuration + ' days'}
          </div>
        )}
      </li>
    )
  }
}

export default Symbol
