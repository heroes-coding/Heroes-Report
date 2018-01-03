import * as d3 from "d3";


export default class WinrateGraph extends React.Component {
    state = {
        g: null,
    }

    onRef = (ref) => {
        this.setState({ g: d3.select(ref) }, () => this.renderBubbles(this.props.data))
    }

    renderBubbles(data) {
        const bubbles = this.state.g.selectAll('.bubble').data(data, d => d.id)

        // Exit
        bubbles.exit().remove()

        // Enter
        const bubblesE = bubbles.enter().append('circle')
            .classed('bubble', true)
            .attr('r', 0)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)

        // Update
        // ...

        // can use animations like this now
        bubblesE.transition().duration(2000).attr('r', d => d.radius)
    }

    componentWillReceiveProps(nextProps) {
        // we have to handle the DOM ourselves now
        if (nextProps.data !== this.props.data) {
            this.renderBubbles(nextProps.data)
        }
    }

    shouldComponentUpdate() { return false }

    render() {
        const { width, height } = this.props
        return (
            <svg width={width} height={height}>
                <g ref={this.onRef} className="bubbles" />
            </svg>
        )
    }
}
